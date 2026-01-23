import { makeStyles, tokens } from '@fluentui/react-components';

export const useLandingPageStyles = makeStyles({
  root: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXXL,
    paddingBlock: tokens.spacingVerticalXXXL,
    paddingInline: 'clamp(1rem, 6vw, 6rem)',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    alignItems: 'center',
    gap: tokens.spacingVerticalXXXL,
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
  },
  title: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 'clamp(1rem, 1.8vw, 1.4rem)',
    lineHeight: 1.5,
    color: tokens.colorNeutralForeground2,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  metricsCard: {
    maxWidth: '360px',
  },
  metricValue: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  sections: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: tokens.spacingHorizontalXXXL,
  },
  card: {
    height: '100%',
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    paddingBlock: tokens.spacingVerticalXXL,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  footerText: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '0.95rem',
  },
  emphasis: {
    color: tokens.colorBrandForegroundLink,
    fontWeight: 600,
  },
  highlightBadge: {
    width: 'fit-content',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: tokens.colorBrandForegroundLink,
    backgroundColor: tokens.colorBrandBackground2,
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
  },
});