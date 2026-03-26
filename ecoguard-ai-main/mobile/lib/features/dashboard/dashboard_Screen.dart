import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text("Welcome back,\nVed!", 
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 24)),
        actions: [
          const Icon(LucideIcons.bellRing, color: Colors.black),
          const SizedBox(width: 15),
          const Icon(LucideIcons.settings, color: Colors.black),
          const SizedBox(width: 15),
          const Icon(LucideIcons.logOut, color: Colors.black),
          const SizedBox(width: 20),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            const SizedBox(height: 20),
            const Text("Today's Action Plan", style: TextStyle(fontWeight: FontWeight.w500)),
            const SizedBox(height: 10),
            _buildActionPlan(), // Your method
            const SizedBox(height: 20),
            _buildHighRiskAlert(), // Red Alert box
            const SizedBox(height: 20),
            _buildHeatmapSection(), // Map Box
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildActionPlan() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.black12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(border: Border.all(color: Colors.black12), borderRadius: BorderRadius.circular(10)),
            child: Column(
              children: [
                const Text("25°C", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: Colors.orange.withOpacity(0.2), borderRadius: BorderRadius.circular(5)),
                  child: const Text("AQI : 160", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Text(
              "Air Quality: Poor\nAvoid outdoor activity today\nWear mask if going outside",
              style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHighRiskAlert() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.redAccent.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("🚨", style: TextStyle(fontSize: 20)),
              SizedBox(width: 8),
              Text("HIGH RISK ALERT", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 15),
          const Text("Flood risk in your area\nin next 48 hours", 
            textAlign: TextAlign.center, 
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          const Text("View Details ->", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildHeatmapSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text("Heatmap", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            Row(
              children: [
                Container(width: 12, height: 12, color: Colors.redAccent),
                const SizedBox(width: 5),
                const Text("High Risk", style: TextStyle(fontSize: 12)),
              ],
            )
          ],
        ),
        const SizedBox(height: 10),
        Container(
          height: 200,
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            image: const DecorationImage(
              image: NetworkImage("https://upload.wikimedia.org/wikipedia/commons/e/ea/Pune_city_map.png"), // Placeholder
              fit: BoxFit.cover,
            ),
          ),
        ),
      ],
    );
  }
}