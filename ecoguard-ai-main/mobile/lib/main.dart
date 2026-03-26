import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
// Ensure these imports match your actual folder structure
import 'features/main_wrapper.dart';

void main() {
  // Required for plugin initialization (like camera or location)
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EcoGuardApp());
}

class EcoGuardApp extends StatelessWidget {
  const EcoGuardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'EcoGuard AI',

      // Global Theme Configuration
      theme: ThemeData(
        useMaterial3: true,
        // Using Montserrat for that premium startup feel
        textTheme: GoogleFonts.montserratTextTheme(Theme.of(context).textTheme),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981), // EcoGuard Emerald
          primary: const Color(0xFF10B981),
          surface: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
          iconTheme: IconThemeData(color: Colors.black),
        ),
      ),

      // Starting point of the application
      home: const MainWrapper(),
    );
  }
}
