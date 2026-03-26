import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';

class HealthInsightsScreen extends StatelessWidget {
  const HealthInsightsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          "HEALTH HUB",
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🩺 1. AI-POWERED ADVICE (The "Neural Engine" Output)
            FadeInDown(child: _buildAIPrescription()),

            const SizedBox(height: 32),
            const Text(
              "VULNERABILITY ASSESSMENT",
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: Colors.black54,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 16),

            // 📋 2. DETAILED METRIC CARDS
            _buildHealthMetric(
              icon: LucideIcons.wind,
              title: "Respiratory Risk",
              value: "High",
              color: Colors.orange,
              advice:
                  "PM2.5 levels in Pune East are reaching 168. Avoid outdoor jogging.",
            ),
            _buildHealthMetric(
              icon: LucideIcons.droplets,
              title: "Skin & Hydration",
              value: "Optimal",
              color: Colors.blue,
              advice:
                  "Humidity is at 65%. Normal hydration levels are sufficient.",
            ),
            _buildHealthMetric(
              icon: LucideIcons.heartPulse,
              title: "Cardiovascular Load",
              value: "Moderate",
              color: Colors.redAccent,
              advice:
                  "Heat index is rising. Stay in shaded areas between 1 PM - 4 PM.",
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAIPrescription() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF10B981), // EcoGuard Emerald
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF10B981).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.sparkles, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Text(
                "NEURAL HEALTH FORECAST",
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            "Based on your profile (Sinusitis), the sudden drop in air quality today may trigger inflammation. Carry your prescribed inhalant.",
            style: TextStyle(
              color: Colors.white,
              fontSize: 17,
              fontWeight: FontWeight.w600,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              "Vulnerable Group Detected",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHealthMetric({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
    required String advice,
  }) {
    return FadeInUp(
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.black.withOpacity(0.05)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(icon, color: color, size: 20),
                    const SizedBox(width: 12),
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ],
                ),
                Text(
                  value.toUpperCase(),
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.w900,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              advice,
              style: TextStyle(
                color: Colors.black.withOpacity(0.6),
                fontSize: 13,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
