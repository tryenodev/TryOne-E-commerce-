import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:tryeno_one/env/env.dart';

class PaymentApi {
  PaymentApi({required this.authToken});

  final String authToken;

  Uri _uri(String path) => Uri.parse('${Env.apiBaseUrl}$path');

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      };

  Future<Map<String, dynamic>> createInvoicePayment({
    required List<Map<String, dynamic>> items,
    String? shopName,
    String? customerName,
    String? customerEmail,
    String? customerPhone,
  }) async {
    final response = await http.post(
      _uri('/api/payments/razorpay/invoice'),
      headers: _headers,
      body: jsonEncode({
        'items': items,
        'shopName': shopName,
        'customerName': customerName,
        'customerEmail': customerEmail,
        'customerPhone': customerPhone,
      }),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data['error'] ?? 'Failed to create invoice payment');
    }
    return data;
  }

  Future<void> verifyInvoicePayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    final response = await http.post(
      _uri('/api/payments/razorpay/verify-invoice'),
      headers: _headers,
      body: jsonEncode({
        'razorpay_order_id': orderId,
        'razorpay_payment_id': paymentId,
        'razorpay_signature': signature,
      }),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data['error'] ?? 'Payment verification failed');
    }
  }
}
