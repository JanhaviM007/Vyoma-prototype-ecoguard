import 'package:flutter/material.dart';

class RiskAnalysisScreen extends StatelessWidget {
  const RiskAnalysisScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Risk Analysis'), elevation: 0),
      body: const Center(child: Text('Risk Analysis Screen')),
    );
  }
}
