import 'package:flutter/material.dart';

import 'features/membership/membership_screen.dart';

void main() {
  runApp(const PulseFitMemberApp());
}

class PulseFitMemberApp extends StatelessWidget {
  const PulseFitMemberApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PulseFit',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F766E)),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (_) => const MemberHomeScreen(),
        '/membership': (_) => const MembershipScreen(),
        '/timetable': (_) => const PlaceholderScreen(
              title: 'Timetable',
              detail: 'Classes, bookings, cancellations, and waitlist status.',
              icon: Icons.calendar_month_outlined,
            ),
        '/notifications': (_) => const PlaceholderScreen(
              title: 'Notifications',
              detail: 'SMS, WhatsApp, email, and push message preferences.',
              icon: Icons.notifications_outlined,
            ),
        '/qr-check-in': (_) => const MembershipScreen(),
      },
    );
  }
}

class MemberHomeScreen extends StatelessWidget {
  const MemberHomeScreen({super.key});

  static const _destinations = [
    _Destination('Membership', '/membership', Icons.verified_user_outlined),
    _Destination('Timetable', '/timetable', Icons.calendar_month_outlined),
    _Destination('Notifications', '/notifications', Icons.notifications_outlined),
    _Destination('QR Check-In', '/qr-check-in', Icons.qr_code_2),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PulseFit Member')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Home', style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 8),
                    const Text('Membership, renewal, and check-in readiness in one place.'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            for (final destination in _destinations)
              Card(
                child: ListTile(
                  leading: Icon(destination.icon),
                  title: Text(destination.label),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).pushNamed(destination.route),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class PlaceholderScreen extends StatelessWidget {
  const PlaceholderScreen({
    required this.title,
    required this.detail,
    required this.icon,
    super.key,
  });

  final String title;
  final String detail;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 56),
              const SizedBox(height: 16),
              Text(title, style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 8),
              Text(detail, textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

class _Destination {
  const _Destination(this.label, this.route, this.icon);

  final String label;
  final String route;
  final IconData icon;
}
