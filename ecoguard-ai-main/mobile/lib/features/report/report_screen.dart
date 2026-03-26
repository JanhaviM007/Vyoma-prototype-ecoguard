import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:http/http.dart' as http;

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  CameraController? _controller;
  Future<void>? _initializeControllerFuture;
  XFile? _capturedImage;
  bool _isAnalyzing = false;

  // AI Generated Data Controllers
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _typeController = TextEditingController();
  final TextEditingController _descController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    final cameras = await availableCameras();
    if (cameras.isEmpty) return;

    _controller = CameraController(cameras.first, ResolutionPreset.high);
    _initializeControllerFuture = _controller!.initialize();
    if (mounted) setState(() {});
  }

  // 🤖 Trigger the "Neural Engine" (Your Next.js API)
  Future<void> _analyzeWithAI(XFile image) async {
    setState(() => _isAnalyzing = true);

    try {
      final bytes = await image.readAsBytes();
      final base64Image = base64Encode(bytes); // Convert for API

      // Replace with your actual Next.js endpoint
      final response = await http.post(
        Uri.parse("https://your-eco-guard-api.vercel.app/api/predict"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"image": base64Image}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _titleController.text = data['itemName'] ?? "Detected Incident";
          _typeController.text = data['category'] ?? "Environmental";
          _descController.text =
              "AI Confidence: ${data['confidence'] ?? 'High'}";
        });
      }
    } catch (e) {
      debugPrint("AI Prediction Failed: $e");
    } finally {
      setState(() => _isAnalyzing = false);
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text("EVIDENCE CAPTURE")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // 1. VIEW FINDER / IMAGE PREVIEW
            _buildCameraPreview(),

            const SizedBox(height: 30),

            // 2. AI STATUS INDICATOR
            if (_isAnalyzing)
              const LinearProgressIndicator(
                color: Color(0xFF10B981),
                backgroundColor: Colors.black12,
              ),

            const SizedBox(height: 20),

            // 3. AUTO-FILLING FORM
            _buildField(
              "INCIDENT TITLE",
              _titleController,
              LucideIcons.brainCircuit,
            ),
            _buildField(
              "PREDICTED CATEGORY",
              _typeController,
              LucideIcons.layers,
            ),
            _buildField(
              "NEURAL DESCRIPTION",
              _descController,
              LucideIcons.alignLeft,
              maxLines: 3,
            ),

            const SizedBox(height: 30),

            // 4. SUBMIT BUTTON
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                onPressed: () {
                  /* logic to save to Supabase */
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                child: const Text(
                  "BROADCAST TO AUTHORITIES",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCameraPreview() {
    return Container(
      height: 250,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(30),
      ),
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          // Live Feed or Captured Image
          _capturedImage == null
              ? FutureBuilder<void>(
                  future: _initializeControllerFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.done) {
                      return CameraPreview(_controller!);
                    } else {
                      return const Center(
                        child: CircularProgressIndicator(color: Colors.white),
                      );
                    }
                  },
                )
              : Image.file(
                  File(_capturedImage!.path),
                  fit: BoxFit.cover,
                  width: double.infinity,
                ),

          // Shutter Button
          Padding(
            padding: const EdgeInsets.all(20),
            child: FloatingActionButton(
              backgroundColor: Colors.white,
              onPressed: () async {
                if (_capturedImage != null) {
                  setState(() => _capturedImage = null); // Reset
                } else {
                  final img = await _controller!.takePicture();
                  setState(() => _capturedImage = img);
                  _analyzeWithAI(img);
                }
              },
              child: Icon(
                _capturedImage == null
                    ? LucideIcons.camera
                    : LucideIcons.refreshCcw,
                color: Colors.black,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField(
    String label,
    TextEditingController controller,
    IconData icon, {
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, size: 18),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
          labelStyle: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Colors.black38,
          ),
        ),
      ),
    );
  }
}
