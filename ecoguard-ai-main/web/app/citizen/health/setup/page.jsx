"use client";

import { useState, useEffect } from "react";
import { saveHealthProfileAction } from "@/app/actions/health-actions";
import { Button } from "@/components/ui/button";

const CHRONIC_OPTIONS = [
  "Asthma",
  "COPD",
  "Diabetes",
  "Hypertension",
  "Bronchitis",
  "Sinusitis",
  "Heart Disease",
];

const SYMPTOM_OPTIONS = [
  "Cough",
  "Breathlessness",
  "Chest Tightness",
  "Headache",
  "Fatigue",
  "Fever",
];

export default function HealthFormPage() {
  const [selectedChronic, setSelectedChronic] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [ageRange, setAgeRange] = useState("18-30");
  const [location, setLocation] = useState({ lat: "", lon: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    });
  }, []);

  const toggleSelection = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  /* RESULT STATE */
  const [result, setResult] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const res = await saveHealthProfileAction(formData);
    setLoading(false);
    if (res?.success) {
      setResult(res);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6 text-center">
          <h2 className="text-3xl font-bold">Analysis Complete</h2>

          <div className={`p-4 rounded-xl border-2 ${result.isVulnerable ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}`}>
            <h3 className="text-xl font-bold mb-2">
              Vulnerability Status: {result.isVulnerable ? "HIGH" : "NORMAL"}
            </h3>
            <p className="text-slate-600">
              {result.isVulnerable
                ? "Your profile indicates higher susceptibility to environmental risks."
                : "Your profile indicates normal resilience to current conditions."}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl text-left">
            <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">AI Health Insight</h4>
            <p className="text-lg text-slate-900 leading-relaxed">
              {result.insight}
            </p>
          </div>

          <Button
            onClick={() => window.location.href = '/citizen'}
            className="w-full bg-black text-white py-3 rounded-xl font-bold"
          >
            Go to Command Center
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <form
        action={handleSubmit}
        className="space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold text-center">Health Profile Setup</h2>


        {/* AGE SELECTION */}
        <div>
          <label className="font-bold block mb-3">Select Age Group</label>
          <div className="grid grid-cols-2 gap-3">
            {["18-30", "31-45", "46-60", "60+"].map((age) => (
              <div
                key={age}
                onClick={() => setAgeRange(age)}
                className={`p-3 rounded-xl cursor-pointer border text-center font-semibold transition ${ageRange === age
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {age}
              </div>
            ))}
          </div>
        </div>

        {/* CHRONIC CONDITIONS */}
        <div>
          <label className="font-bold block mb-3">
            Select Chronic Conditions
          </label>
          <div className="flex flex-wrap gap-3">
            {CHRONIC_OPTIONS.map((item) => (
              <div
                key={item}
                onClick={() =>
                  toggleSelection(item, selectedChronic, setSelectedChronic)
                }
                className={`px-4 py-2 rounded-full cursor-pointer text-sm font-semibold transition ${selectedChronic.includes(item)
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* CURRENT SYMPTOMS */}
        <div>
          <label className="font-bold block mb-3">
            Select Current Symptoms
          </label>
          <div className="flex flex-wrap gap-3">
            {SYMPTOM_OPTIONS.map((item) => (
              <div
                key={item}
                onClick={() =>
                  toggleSelection(item, selectedSymptoms, setSelectedSymptoms)
                }
                className={`px-4 py-2 rounded-full cursor-pointer text-sm font-semibold transition ${selectedSymptoms.includes(item)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Inputs for Server Action */}
        <input type="hidden" name="ageRange" value={ageRange} />
        <input
          type="hidden"
          name="chronicDiseases"
          value={selectedChronic.join(",")}
        />
        <input
          type="hidden"
          name="currentSymptoms"
          value={selectedSymptoms.join(",")}
        />
        <input type="hidden" name="latitude" value={location.lat} />
        <input type="hidden" name="longitude" value={location.lon} />

        {/* SUBMIT BUTTON */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-bold text-lg"
        >
          {loading ? "Analyzing Environment..." : "Generate AI Health Insight"}
        </Button>
      </form>
    </div>
  );
}
