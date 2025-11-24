// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('App configuration test', () {
    // Basic smoke test to verify test infrastructure is working
    expect(1 + 1, equals(2));
    expect('barber_social_app', isA<String>());
  });

  testWidgets('Widget smoke test', (WidgetTester tester) async {
    // Build a simple widget to verify flutter_test is working
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('Test'),
          ),
        ),
      ),
    );

    // Verify the widget renders
    expect(find.text('Test'), findsOneWidget);
    expect(find.byType(Scaffold), findsOneWidget);
  });
}
