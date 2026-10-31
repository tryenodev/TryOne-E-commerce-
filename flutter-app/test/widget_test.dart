import 'package:flutter_test/flutter_test.dart';
import 'package:tryeno_one/main.dart';

void main() {
  testWidgets('Tryeno One smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const TryenoOneApp());
    expect(find.text('Welcome to Tryeno One'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
  });
}
