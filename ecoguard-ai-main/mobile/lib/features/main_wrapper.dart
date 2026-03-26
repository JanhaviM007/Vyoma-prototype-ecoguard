import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'dashboard/dashboard_screen.dart';
import 'risks/risk_analysis_screen.dart';
import 'health/health_insights_screen.dart';
import 'sos/sos_screen.dart';
import 'report/report_screen.dart';

class MainWrapper extends StatefulWidget {
  const MainWrapper({super.key});

  @override
  State<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends State<MainWrapper> {
  int _currentIndex = 2;

  final List<Widget> _pages = [
    const RiskAnalysisScreen(),
    const ReportScreen(),
    const DashboardScreen(),
    const HealthInsightsScreen(),
    const SOSScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        // Removed 'const' here to fix your error
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(
              0.05,
            ), // Dynamic values cannot be const
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(LucideIcons.shieldAlert, "Risks", 0),
          _buildNavItem(LucideIcons.camera, "Report", 1),
          _buildDashboardCircle(),
          _buildNavItem(LucideIcons.heartPulse, "Health", 3),
          _buildNavItem(LucideIcons.phoneCall, "SOS", 4),
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    bool isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 22,
            color: isSelected ? const Color(0xFF10B981) : Colors.black45,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              color: isSelected ? const Color(0xFF10B981) : Colors.black45,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardCircle() {
    bool isSelected = _currentIndex == 2;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = 2),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            transform: Matrix4.translationValues(0, -15, 0),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              // Removed 'const' here
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected ? const Color(0xFF10B981) : Colors.black,
                width: 2,
              ),
              boxShadow: const [
                BoxShadow(color: Colors.black12, blurRadius: 10),
              ],
            ),
            child: Icon(
              LucideIcons.layoutDashboard,
              size: 28,
              color: isSelected ? const Color(0xFF10B981) : Colors.black,
            ),
          ),
          const Text(
            "Dashboard",
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
