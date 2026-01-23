import {
  Button,
  Card,
  CardHeader,
  CardPreview,
  Caption1,
  Divider,
  Subtitle2,
  Body1,
} from '@fluentui/react-components';
import { ShieldLockRegular, ClipboardBulletListLtrRegular, LineHorizontal5ErrorRegular } from '@fluentui/react-icons';
import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLandingPageStyles } from './LandingPage.styles.ts';

const complianceHighlights = [
  'Zero Trust enforced from login to submission',
  'Managed identities and encrypted data flows',
  'Record-level authorization for every task',
];

export const LandingPage = () => {
  const styles = useLandingPageStyles();
  const { isAuthenticated, signIn, signOut } = useAuth();

  const actionButtons = useMemo(() => {
    if (isAuthenticated) {
      return (
        <div className={styles.actions}>
          <Button appearance="primary" size="large" onClick={signOut} aria-label="Sign out of Warp Reporting">
            Sign out
          </Button>
          <Button
            appearance="secondary"
            size="large"
            as="a"
            href="/tasks"
            aria-label="Navigate to my assigned tasks"
          >
            View my tasks
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.actions}>
        <Button appearance="primary" size="large" onClick={signIn} aria-label="Sign in to Warp Reporting">
          Sign in
        </Button>
      </div>
    );
  }, [isAuthenticated, signIn, signOut, styles.actions]);

  return (
    <div className={styles.root}>
      <main className={styles.content}>
        <section className={styles.hero} aria-labelledby="landing-heading">
          <div className={styles.heroText}>
            <span className={styles.highlightBadge}>Enterprise Security</span>
            <h1 id="landing-heading" className={styles.title}>
              Warp Reporting
            </h1>
            <p className={styles.subtitle}>
              A secure injury and medical reporting platform that keeps every workflow compliant, audited, and ready
              for executive review. Capture critical data, enforce authorization, and accelerate care coordination in a
              single Zero Trust experience.
            </p>
            {actionButtons}
            <Card className={styles.metricsCard} appearance="outline" aria-label="Operational metric">
              <CardHeader
                header={<Subtitle2>Incident readiness</Subtitle2>}
                description={<Caption1>Tasks triaged within SLA</Caption1>}
              />
              <CardPreview>
                <p className={styles.metricValue}>99.98%</p>
              </CardPreview>
            </Card>
          </div>
          <div role="presentation" aria-hidden>
            <Card appearance="filled" className={styles.card}>
              <CardHeader
                header={<Subtitle2>Clinical data pipeline</Subtitle2>}
                description="Automated validation, encryption, and Dataverse persistence"
                image={<ShieldLockRegular fontSize={28} />}
              />
              <CardPreview>
                <Body1>
                  Warp Reporting aligns clinical teams, HR, and compliance officers across geographies. Real-time
                  telemetry ensures every update is tracked, signed, and ready for governance reviews.
                </Body1>
              </CardPreview>
            </Card>
          </div>
        </section>

        <section className={styles.sections} aria-label="Key capabilities">
          <Card appearance="outline" className={styles.card}>
            <CardHeader
              header={<Subtitle2>Task orchestration</Subtitle2>}
              description="Deep linking, dirty-state detection, and save/resume"
              image={<ClipboardBulletListLtrRegular fontSize={24} />}
            />
            <CardPreview>
              <Body1>
                Route injured user data, medical documentation, and approvals through a defense-in-depth workflow that
                never exposes records to unauthorized roles.
              </Body1>
            </CardPreview>
          </Card>

          <Card appearance="outline" className={styles.card}>
            <CardHeader
              header={<Subtitle2>Continuous compliance</Subtitle2>}
              description="Audit trails, MFA enforcement, encrypted transport"
              image={<LineHorizontal5ErrorRegular fontSize={24} />}
            />
            <CardPreview>
              <Body1>
                Every submission validates JWT claims, task ownership, and Dataverse persistence to keep regulators and
                leadership confident in every report.
              </Body1>
            </CardPreview>
          </Card>

          <Card appearance="outline" className={styles.card}>
            <CardHeader header={<Subtitle2>Human-centered design</Subtitle2>} description="Fluent UI v9, accessible by default" />
            <CardPreview>
              <Body1>
                From landing page to review, the experience remains responsive, screen-reader friendly, and optimized for
                enterprise accessibility guidelines.
              </Body1>
            </CardPreview>
          </Card>
        </section>

        <section aria-label="Compliance highlights">
          <Divider />
          <Body1 as="h2" className={styles.subtitle}>
            Designed for regulated industries
          </Body1>
          <ul aria-label="Warp Reporting compliance commitments">
            {complianceHighlights.map((item) => (
              <li key={item}>
                <Body1>{item}</Body1>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Warp Reporting • Secure injury and medical reporting with <span className={styles.emphasis}>Zero Trust assurance</span>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;