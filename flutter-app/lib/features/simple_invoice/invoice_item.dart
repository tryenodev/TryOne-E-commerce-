class InvoiceItem {
  InvoiceItem({
    required this.name,
    required this.quantity,
    required this.price,
    this.taxPercent = 0,
    this.discountPercent = 0,
  });

  final String name;
  final int quantity;
  final double price;
  final double taxPercent;
  final double discountPercent;

  double get lineTotal {
    final subtotal = quantity * price;
    final afterDiscount = subtotal * (1 - discountPercent / 100);
    return afterDiscount * (1 + taxPercent / 100);
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'quantity': quantity,
        'price': price,
        'taxPercent': taxPercent,
        'discountPercent': discountPercent,
      };
}
