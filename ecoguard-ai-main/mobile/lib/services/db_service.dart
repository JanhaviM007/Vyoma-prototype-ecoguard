import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';

class DBService {
  static final _supabase = Supabase.instance.client;

  static Future<void> submitReport({
    required File image,
    required String title,
    required String type,
    required String location,
    required String description,
  }) async {
    // 1. Upload to Storage
    final path = 'incidents/${DateTime.now().millisecondsSinceEpoch}.jpg';
    await _supabase.storage.from('reports').upload(path, image);
    final imageUrl = _supabase.storage.from('reports').getPublicUrl(path);

    // 2. Insert into DB (Same table as Web app)
    await _supabase.from('reports').insert({
      'title': title,
      'type': type,
      'location': location,
      'description': description,
      'image_url': imageUrl,
      'status': 'PENDING',
    });
  }
}
