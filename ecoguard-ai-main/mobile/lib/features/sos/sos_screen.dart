import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

class SOSScreen extends StatelessWidget {
  const SOSScreen({super.key});

  // Helper to trigger phone calls
  Future<void> _makeCall(String number) async {
    final Uri url = Uri.parse('tel:$number');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "EMERGENCY SOS",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            // BIG PANIC BUTTON
            GestureDetector(
              onTap: () => _makeCall("112"), // Universal Emergency Number
              child: Container(
                height: 200,
                width: 200,
                decoration: BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.red.withOpacity(0.3),
                      blurRadius: 30,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: const Center(
                  child: Text(
                    "SOS",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 40,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            const Text(
              "Tap for immediate assistance",
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 40),

            // EMERGENCY LIST
            _buildEmergencyTile(LucideIcons.flame, "Fire Department", "101"),
            _buildEmergencyTile(LucideIcons.shield, "Police", "100"),
            _buildEmergencyTile(LucideIcons.activity, "Ambulance", "102"),
          ],
        ),
      ),
    );
  }

  Widget _buildEmergencyTile(IconData icon, String title, String number) {
    return ListTile(
      leading: Icon(icon, color: Colors.redAccent),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      trailing: const Icon(LucideIcons.phone),
      onTap: () => _makeCall(number),
    );
  }
}
