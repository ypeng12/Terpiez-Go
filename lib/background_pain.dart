
import 'details_view.dart';
import 'package:flutter/material.dart';

class BackgroundPainter extends CustomPainter {
  final double value;

  BackgroundPainter(this.value);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = LinearGradient(
        colors: [Color.fromARGB(255, 246, 247, 203), Color.fromARGB(255, 234, 240, 155), Color.fromARGB(255, 246, 202, 176)],
        stops: [value, value + 0.25, value + 0.5],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
