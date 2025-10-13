import { Text, type TextProps, type TextStyle } from 'react-native';
import { Colors, Typography } from '~/shared/constants/theme';
import { useColorScheme } from '~/shared/hooks/use-color-scheme';

export type ThemedTextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'caption'
  | 'mono'
  | 'button'
  | 'link';

type LegacyVariant = 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';

type Tone =
  | 'default'
  | 'muted'
  | 'accent'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning';

const variantAliases: Record<LegacyVariant, ThemedTextVariant> = {
  default: 'body',
  title: 'title',
  defaultSemiBold: 'heading',
  subtitle: 'subtitle',
  link: 'link',
};

const toneToColorKey: Record<Tone, keyof (typeof Colors)['light']> = {
  default: 'text',
  muted: 'muted',
  accent: 'accent',
  secondary: 'secondary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
};

const variantStyles: Record<ThemedTextVariant, TextStyle> = {
  display: { ...Typography.display },
  title: { ...Typography.title },
  heading: { ...Typography.heading },
  subtitle: { ...Typography.subtitle },
  body: { ...Typography.body },
  label: { ...Typography.label },
  caption: { ...Typography.caption },
  mono: { ...Typography.mono },
  button: { ...Typography.button },
  link: { ...Typography.link, textDecorationLine: 'underline' },
};

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemedTextVariant | LegacyVariant;
  tone?: Tone;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'body',
  tone = 'default',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const resolvedVariant = variantAliases[type as LegacyVariant] ?? (type as ThemedTextVariant);
  const variantStyle = variantStyles[resolvedVariant] ?? variantStyles.body;

  const fallbackColorKey = toneToColorKey[tone];
  const palette = Colors[colorScheme];
  const manualColor = colorScheme === 'light' ? lightColor : darkColor;
  const defaultColor = manualColor ?? (palette[fallbackColorKey] as string) ?? palette.text;

  const hasColorOverride = (() => {
    if (Array.isArray(style)) {
      return style.some(
        (entry) => entry && typeof entry === 'object' && 'color' in entry && entry.color != null,
      );
    }

    return Boolean(style && typeof style === 'object' && 'color' in style && style.color != null);
  })();

  const baseStyle = hasColorOverride ? undefined : { color: defaultColor };

  return (
    <Text
      style={[variantStyle, baseStyle, style]}
      {...rest}
    />
  );
}
