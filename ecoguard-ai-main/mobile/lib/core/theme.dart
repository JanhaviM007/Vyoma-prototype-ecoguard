
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const backgroundColor = Color(0xFF050505);
  static const cardColor = Color(0xFF0A0A0A);
  static const accentColor = Color(0xFF10B981); // Our Emerald Green
  static const textSecondary = Color(0xFF94A3B8);
}

class AppTheme {
  static final darkTheme = ThemeData.dark().copyWith(
    scaffoldBackgroundColor: AppColors.backgroundColor,
    textTheme: GoogleFonts.montserratTextTheme().apply(bodyColor: Colors.white),
    // Standardizing our card look
    cardTheme: CardThemeData(
      color: AppColors.cardColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
      ),
    ),
  );
}