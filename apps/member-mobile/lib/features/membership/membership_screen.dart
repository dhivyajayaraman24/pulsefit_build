import 'package:flutter/material.dart';

class MembershipScreen extends StatelessWidget {
  const MembershipScreen({super.key});

  static const _membership = _MembershipSummary(
    memberName: 'Nisha Rao',
    memberId: 'PF-1148',
    plan: 'Quarterly Strength',
    homeBranch: 'Indiranagar',
    renewalDate: '19 Nov 2026',
    autoRenew: false,
    graceUntil: '22 Nov 2026',
    eligibility: _EligibilityDecision(
      allowed: false,
      reason: 'Payment is due before booking or check-in.',
      resolutionPath: 'Pay now or contact the front desk for assisted renewal.',
    ),
  );

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Membership')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            DecoratedBox(
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_membership.memberName, style: theme.textTheme.headlineSmall),
                    const SizedBox(height: 4),
                    Text('${_membership.memberId} · ${_membership.homeBranch}'),
                    const SizedBox(height: 14),
                    const _StatusBadge(label: 'Renewal due', icon: Icons.warning_amber_rounded),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            _InfoGrid(summary: _membership),
            const SizedBox(height: 14),
            _FlagTile(
              icon: Icons.schedule_outlined,
              title: 'Grace period active',
              detail: 'Grace through ${_membership.graceUntil}',
            ),
            const SizedBox(height: 14),
            _EligibilityCard(decision: _membership.eligibility),
            const SizedBox(height: 14),
            FilledButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.payments_outlined),
              label: const Text('Pay renewal'),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.support_agent),
              label: const Text('Contact front desk'),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoGrid extends StatelessWidget {
  const _InfoGrid({required this.summary});

  final _MembershipSummary summary;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth > 520 ? 2 : 1;
        return GridView.count(
          crossAxisCount: columns,
          childAspectRatio: columns == 2 ? 2.8 : 4.5,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _InfoTile(label: 'Plan', value: summary.plan),
            _InfoTile(label: 'Renewal', value: summary.renewalDate),
            _InfoTile(label: 'Auto-renew', value: summary.autoRenew ? 'Enabled' : 'Off'),
            _InfoTile(label: 'Home branch', value: summary.homeBranch),
          ],
        );
      },
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label, style: Theme.of(context).textTheme.labelMedium),
            const SizedBox(height: 4),
            Text(value, style: Theme.of(context).textTheme.titleMedium),
          ],
        ),
      ),
    );
  }
}

class _FlagTile extends StatelessWidget {
  const _FlagTile({required this.icon, required this.title, required this.detail});

  final IconData icon;
  final String title;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(8),
      ),
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(detail),
    );
  }
}

class _EligibilityCard extends StatelessWidget {
  const _EligibilityCard({required this.decision});

  final _EligibilityDecision decision;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final background = decision.allowed ? colorScheme.secondaryContainer : colorScheme.errorContainer;
    final foreground = decision.allowed ? colorScheme.onSecondaryContainer : colorScheme.onErrorContainer;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(decision.allowed ? Icons.verified_outlined : Icons.block_outlined, color: foreground),
            const SizedBox(width: 12),
            Expanded(
              child: DefaultTextStyle.merge(
                style: TextStyle(color: foreground),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      decision.allowed ? 'Eligible for booking and check-in' : 'Booking/check-in blocked',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(color: foreground),
                    ),
                    const SizedBox(height: 8),
                    Text('Reason: ${decision.reason}'),
                    const SizedBox(height: 4),
                    Text('Resolution: ${decision.resolutionPath}'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 17),
            const SizedBox(width: 6),
            Text(label, style: Theme.of(context).textTheme.labelLarge),
          ],
        ),
      ),
    );
  }
}

class _MembershipSummary {
  const _MembershipSummary({
    required this.memberName,
    required this.memberId,
    required this.plan,
    required this.homeBranch,
    required this.renewalDate,
    required this.autoRenew,
    required this.graceUntil,
    required this.eligibility,
  });

  final String memberName;
  final String memberId;
  final String plan;
  final String homeBranch;
  final String renewalDate;
  final bool autoRenew;
  final String graceUntil;
  final _EligibilityDecision eligibility;
}

class _EligibilityDecision {
  const _EligibilityDecision({
    required this.allowed,
    required this.reason,
    required this.resolutionPath,
  });

  final bool allowed;
  final String reason;
  final String resolutionPath;
}
