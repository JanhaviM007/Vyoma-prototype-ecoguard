import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class AIService {
  // Use your local IP or deployed Vercel URL
  // If using Android Emulator and local server, use 10.0.2.2 instead of localhost
  static const String _endpoint =
      "https://your-nextjs-app.vercel.app/api/analyze";

  static Future<Map<String, dynamic>?> analyzeIncident(File image) async {
    try {
      final bytes = await image.readAsBytes();
      final base64Image = base64Encode(bytes);

      final response = await http.post(
        Uri.parse(_endpoint),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"image": base64Image}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print("AI Connection Failed: $e");
      return null;
    }
  }
}
