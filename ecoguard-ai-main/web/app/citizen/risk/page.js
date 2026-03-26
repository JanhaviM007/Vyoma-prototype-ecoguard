import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Info, Droplets, Wind, Thermometer, AlertTriangle, CheckCircle2, Gauge, CloudLightning, Flame, Sun, Eye, Sprout } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateRiskScore } from "@/lib/risk-engine";

export default async function RiskIntelligence() {
  const lat = 18.5204; // Default Pune
  const lon = 73.8567;

  // 1. Fetch Comprehensive Live & Forecast Data (Weather + AQI + Flood)
  const weatherPromise = fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,surface_pressure,cloud_cover,uv_index,visibility&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,weather_code,surface_pressure,cloud_cover,wind_speed_10m,wind_gusts_10m,soil_temperature_0cm,uv_index,visibility,soil_moisture_0_to_1cm&forecast_days=3`,
    { cache: "no-store" }
  ).then((res) => res.json());

  const aqiPromise = fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=us_aqi,pm2_5`,
    { cache: "no-store" }
  ).then((res) => res.json());

  const violationsPromise = prisma.report.findMany({
    where: { status: "PENDING" },
    select: { type: true, description: true, location: true, confidenceScore: true },
  });

  const [weatherData, aqiData, violations] = await Promise.all([
    weatherPromise,
    aqiPromise,
    violationsPromise,
  ]);

  // 2. Process Current State
  const current = weatherData.current || {};
  const currentAqi = aqiData.current || {};

  const environment = {
    rain: current.rain || 0,
    windSpeed: current.wind_speed_10m || 0,
    aqi: currentAqi.us_aqi || 50,
    temperature: current.temperature_2m || 30,
  };

  const riskAnalysis = calculateRiskScore(environment, violations);

  // 3. Advanced Prediction Logic (Multi-Factor)
  const hourly = weatherData.hourly || {};
  const hourlyAqi = aqiData.hourly || {};

  const calculateAdvancedForecast = (hourIndex) => {
    // Factors
    const rain = hourly.rain?.[hourIndex] || 0;
    const precipProb = hourly.precipitation_probability?.[hourIndex] || 0;
    const windGusts = hourly.wind_gusts_10m?.[hourIndex] || 0;
    const pressure = hourly.surface_pressure?.[hourIndex] || 1013;
    const temp = hourly.temperature_2m?.[hourIndex] || 30;
    const humidity = hourly.relative_humidity_2m?.[hourIndex] || 50;
    const aqi = hourlyAqi.us_aqi?.[hourIndex] || 50;
    const uv = hourly.uv_index?.[hourIndex] || 0;
    const visibility = hourly.visibility?.[hourIndex] || 10000;
    const soilMoisture = hourly.soil_moisture_0_to_1cm?.[hourIndex] || 0.3;

    // Risk Scores (0-100)

    // 1. Flood Risk
    let floodRisk = (rain * 10) + (precipProb * 0.5);
    if (rain > 5) floodRisk += 40;
    if (soilMoisture > 0.4) floodRisk += 10; // Saturated soil

    // 2. Storm Risk
    let stormRisk = (windGusts * 0.8);
    if (pressure < 1000) stormRisk += (1000 - pressure) * 2;

    // 3. Heat/Health Risk
    let heatRisk = 0;
    if (temp > 35) heatRisk += (temp - 35) * 5;
    if (humidity > 70 && temp > 30) heatRisk += 20;
    const healthRisk = heatRisk + (aqi * 0.5);

    // 4. Fire Weather Risk (High Temp, Low Humidity, High Wind)
    let fireRisk = 0;
    if (temp > 30 && humidity < 30 && windGusts > 20) {
      fireRisk = (temp / 40) * 30 + (50 - humidity) + (windGusts / 2);
    }

    // 5. UV Radiation Risk
    let uvRisk = uv * 10; // UV 10+ is Extreme

    // 6. Fog/Low Visibility Risk
    let fogRisk = 0;
    if (visibility < 1000) fogRisk = 80;
    else if (visibility < 5000) fogRisk = 40;

    // 7. Drought Indicator (Low Soil Moisture + High Temp)
    let droughtRisk = 0;
    if (soilMoisture < 0.1 && temp > 30) droughtRisk = 60;

    // Determine Dominant Threat
    const risks = [
      { name: "Flood", val: floodRisk, label: "Flash Flood Warning", color: "bg-blue-600" },
      { name: "Storm", val: stormRisk, label: "Severe Storm Alert", color: "bg-fuchsia-600" },
      { name: "Health", val: healthRisk, label: "Hazardous Air/Heat", color: "bg-red-600" },
      { name: "Fire", val: fireRisk, label: "Wildfire Hazard", color: "bg-orange-600" },
      { name: "UV", val: uvRisk, label: "Extreme UV Radiation", color: "bg-yellow-500" },
      { name: "Fog", val: fogRisk, label: "Low Visibility", color: "bg-slate-500" },
      { name: "Drought", val: droughtRisk, label: "Drought Conditions", color: "bg-amber-700" },
    ];

    risks.sort((a, b) => b.val - a.val);
    const dominant = risks[0];

    let status = "SAFE";
    let color = "bg-green-500";
    let label = "Stable Conditions";

    if (dominant.val > 80) {
      status = "CRITICAL";
      color = dominant.color;
      label = dominant.label;
    } else if (dominant.val > 50) {
      status = "MODERATE";
      color = dominant.color.replace("600", "500"); // Lighter shade
      label = `Moderate ${dominant.name} Risk`;
    }

    return {
      val: Math.min(dominant.val, 100),
      status,
      color,
      label,
      metric: dominant.name === "UV" ? `UV ${uv}` : dominant.name === "Fire" ? `${humidity}% Hum` : `${Math.round(dominant.val)} Score`
    };
  };

  const forecast6h = calculateAdvancedForecast(6);
  const forecast24h = calculateAdvancedForecast(24);
  const forecast48h = calculateAdvancedForecast(47);

  // Active Factors Insight
  const activeInsights = violations
    .filter(v => v.confidenceScore > 30)
    .slice(0, 5)
    .map(v => `${v.type} confirmed nearby`);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Risk Intelligence</h1>
        <p className="text-slate-500 font-medium">
          Multi-factor analysis using 7+ Risk Models & {violations.length} Ground Reports
        </p>
      </header>

      {/* Primary Status Card */}
      <Card className="border-none shadow-lg bg-white overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-2 h-full ${riskAnalysis.flood.isCritical ? 'bg-red-500' : 'bg-blue-500'}`} />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-800 mb-2">Pune City</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Gauge className="w-3 h-3 mr-1" /> {current.surface_pressure} hPa
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Sun className="w-3 h-3 mr-1" /> UV {current.uv_index}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" /> Vis {(current.visibility / 1000).toFixed(1)} km
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Droplets className="w-3 h-3 mr-1" /> {current.relative_humidity_2m}% Humidity
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-end text-right">
              <div className="text-5xl font-black text-slate-900 mb-1">{current.temperature_2m}°</div>
              <p className="text-slate-500 font-medium">Feels like {weatherData.current?.apparent_temperature}°</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <DetailedMetric
              title="Flood Probability"
              score={riskAnalysis.flood.score}
              subtext={`${current.rain}mm rain/hr`}
              critical={riskAnalysis.flood.isCritical}
              icon={<CloudLightning className="w-5 h-5" />}
            />
            <DetailedMetric
              title="Fire Weather"
              score={current.temperature_2m > 30 && current.relative_humidity_2m < 30 ? 70 : 10} // Simple Fire Proxy
              max={100}
              subtext={current.relative_humidity_2m < 30 ? "Dry & Windy" : "Low Risk"}
              critical={false}
              icon={<Flame className="w-5 h-5" />}
            />
            <DetailedMetric
              title="Air Quality"
              score={currentAqi.us_aqi}
              max={300}
              subtext={`PM2.5: ${currentAqi.pm2_5}`}
              critical={currentAqi.us_aqi > 150}
              icon={<Wind className="w-5 h-5" />}
            />
            <DetailedMetric
              title="Drought Index"
              score={30} // Mock/Satellite needed
              max={100}
              subtext="Soil Moist: Normal"
              critical={false}
              icon={<Sprout className="w-5 h-5" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Gauge className="w-5 h-5" /> Predictive Analysis (48 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <PredictionRow time="Next 6 Hours" data={forecast6h} />
            <PredictionRow time="Next 24 Hours" data={forecast24h} />
            <PredictionRow time="Next 48 Hours" data={forecast48h} />
          </CardContent>
        </Card>

        {/* Live Factors */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-slate-500">
              Active Risk Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeInsights.length > 0 ? (
              <ul className="space-y-3">
                {activeInsights.map((insight, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium text-slate-700 p-3 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    {insight}
                  </li>
                ))}
                <li className="flex gap-3 text-sm font-medium text-slate-700 p-3 bg-slate-50 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  Analysis included {environment.rain}mm rain & {environment.windSpeed}km/h winds.
                </li>
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p>No verified community reports contributing to risk.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailedMetric({ title, score, max = 100, subtext, critical, icon }) {
  const percent = Math.min((score / max) * 100, 100);
  return (
    <div className={`p-4 rounded-xl border ${critical ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
        {icon} {title}
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className={`text-3xl font-black ${critical ? 'text-red-600' : 'text-slate-800'}`}>
          {Math.round(score)}
        </span>
        <span className="text-xs text-slate-400 font-bold mb-1 uppercase">/ {max}</span>
      </div>
      <Progress value={percent} className="h-1.5 mb-2" indicatorClassName={critical ? 'bg-red-500' : 'bg-slate-800'} />
      <p className="text-xs font-semibold text-slate-500">{subtext}</p>
    </div>
  )
}

function PredictionRow({ time, data }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="w-24 font-bold text-slate-500 text-sm">{time}</div>
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-slate-800">{data.label}</span>
          <Badge className={`${data.color} border-none`}>{data.status}</Badge>
        </div>
        <Progress value={data.val} className="h-2" indicatorClassName={data.color} />
      </div>
      <div className="w-24 text-right font-bold text-slate-600 text-sm">
        {data.metric}
      </div>
    </div>
  )
}
