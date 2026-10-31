import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:tryeno_one/core/payment_api.dart';
import 'package:tryeno_one/core/session_store.dart';
import 'package:tryeno_one/features/simple_invoice/invoice_item.dart';

class SimpleInvoicePage extends StatefulWidget {
  const SimpleInvoicePage({super.key});

  @override
  State<SimpleInvoicePage> createState() => _SimpleInvoicePageState();
}

class _SimpleInvoicePageState extends State<SimpleInvoicePage> {
  final _shopController = TextEditingController();
  final _customerNameController = TextEditingController();
  final _customerEmailController = TextEditingController();
  final _customerPhoneController = TextEditingController();
  final _itemNameController = TextEditingController();
  final _qtyController = TextEditingController(text: '1');
  final _priceController = TextEditingController();
  final _taxController = TextEditingController(text: '0');
  final _discountController = TextEditingController(text: '0');

  final List<InvoiceItem> _items = [];
  late final Razorpay _razorpay;
  PaymentApi? _paymentApi;
  bool _paying = false;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _onPaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _onPaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _onExternalWallet);
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(SessionStore.tokenKey);
    final name = prefs.getString(SessionStore.userNameKey);
    if (!mounted) return;
    if (token != null) {
      _paymentApi = PaymentApi(authToken: token);
    }
    if (name != null) {
      _customerNameController.text = name;
    }
  }

  @override
  void dispose() {
    _razorpay.clear();
    _shopController.dispose();
    _customerNameController.dispose();
    _customerEmailController.dispose();
    _customerPhoneController.dispose();
    _itemNameController.dispose();
    _qtyController.dispose();
    _priceController.dispose();
    _taxController.dispose();
    _discountController.dispose();
    super.dispose();
  }

  double get _total => _items.fold(0, (sum, item) => sum + item.lineTotal);

  void _addItem() {
    final name = _itemNameController.text.trim();
    final qty = int.tryParse(_qtyController.text) ?? 0;
    final price = double.tryParse(_priceController.text) ?? 0;
    final tax = double.tryParse(_taxController.text) ?? 0;
    final discount = double.tryParse(_discountController.text) ?? 0;

    if (name.isEmpty || qty <= 0 || price <= 0) {
      _showSnack('Enter item name, quantity, and price');
      return;
    }

    setState(() {
      _items.add(
        InvoiceItem(
          name: name,
          quantity: qty,
          price: price,
          taxPercent: tax,
          discountPercent: discount,
        ),
      );
      _itemNameController.clear();
      _qtyController.text = '1';
      _priceController.clear();
      _taxController.text = '0';
      _discountController.text = '0';
    });
  }

  Future<void> _makeInvoice() async {
    if (_items.isEmpty) {
      _showSnack('Add at least one item');
      return;
    }
    if (_paymentApi == null) {
      _showSnack('Please sign in again');
      return;
    }

    setState(() => _paying = true);
    try {
      final data = await _paymentApi!.createInvoicePayment(
        items: _items.map((e) => e.toJson()).toList(),
        shopName: _shopController.text.trim(),
        customerName: _customerNameController.text.trim(),
        customerEmail: _customerEmailController.text.trim(),
        customerPhone: _customerPhoneController.text.trim(),
      );

      final options = {
        'key': data['keyId'],
        'amount': data['amount'],
        'currency': data['currency'] ?? 'INR',
        'name': data['description'] ?? 'Simple Invoice',
        'order_id': data['razorpayOrderId'],
        'description': data['receipt'],
        'prefill': {
          'name': data['customer']?['name'],
          'email': data['customer']?['email'],
          'contact': data['customer']?['contact'],
        },
      };

      _razorpay.open(options);
    } catch (e) {
      _showSnack(e.toString());
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  Future<void> _onPaymentSuccess(PaymentSuccessResponse response) async {
    try {
      await _paymentApi?.verifyInvoicePayment(
        orderId: response.orderId ?? '',
        paymentId: response.paymentId ?? '',
        signature: response.signature ?? '',
      );
      if (!mounted) return;
      setState(() => _items.clear());
      _showSnack('Invoice paid successfully!');
    } catch (e) {
      _showSnack(e.toString());
    }
  }

  void _onPaymentError(PaymentFailureResponse response) {
    _showSnack(response.message ?? 'Payment failed');
  }

  void _onExternalWallet(ExternalWalletResponse response) {
    _showSnack('External wallet: ${response.walletName}');
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Simple Invoice'),
        actions: [
          TextButton(
            onPressed: _paying || _items.isEmpty ? null : _makeInvoice,
            child: Text(
              _paying ? '...' : 'Make Invoice',
              style: TextStyle(
                color: _paying || _items.isEmpty
                    ? Colors.grey
                    : Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _section(
            title: 'Shop Details',
            child: TextField(
              controller: _shopController,
              decoration: const InputDecoration(
                hintText: 'Shop name',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          const SizedBox(height: 12),
          _section(
            title: 'Customer Details',
            child: Column(
              children: [
                TextField(
                  controller: _customerNameController,
                  decoration: const InputDecoration(
                    hintText: 'Customer name',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _customerEmailController,
                  decoration: const InputDecoration(
                    hintText: 'Email',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _customerPhoneController,
                  decoration: const InputDecoration(
                    hintText: 'Phone',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.phone,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          _section(
            title: 'Add Item',
            initiallyExpanded: true,
            child: Column(
              children: [
                TextField(
                  controller: _itemNameController,
                  decoration: const InputDecoration(
                    hintText: 'Enter Item Name',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _qtyController,
                        decoration: const InputDecoration(
                          hintText: 'Qty',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _priceController,
                        decoration: const InputDecoration(
                          hintText: 'Price',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _taxController,
                        decoration: const InputDecoration(
                          hintText: 'Tax %',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _discountController,
                        decoration: const InputDecoration(
                          hintText: 'Discount %',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.tonal(
                    onPressed: _addItem,
                    child: const Text('Add'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Added Item Details',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  if (_items.isEmpty)
                    const Text('No items added yet')
                  else
                    ..._items.map(
                      (item) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(item.name),
                        subtitle: Text(
                          '${item.quantity} × ₹${item.price.toStringAsFixed(2)}',
                        ),
                        trailing: Text('₹${item.lineTotal.toStringAsFixed(2)}'),
                      ),
                    ),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Amount',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '₹${_total.toStringAsFixed(2)}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _section({
    required String title,
    required Widget child,
    bool initiallyExpanded = false,
  }) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: ExpansionTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        initiallyExpanded: initiallyExpanded,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: child,
          ),
        ],
      ),
    );
  }
}
