import Link from 'next/link';
import { Link as ThemeUILink, ThemeUIStyleObject } from 'theme-ui';

type Props = {
  children: JSX.Element;
  href: string;
  title: string;
  styles?: ThemeUIStyleObject;
  queryParams?: Record<string, string>;
  scroll?: boolean;
};

export const InternalLink = ({
  children,
  title,
  href,
  styles,
  queryParams,
  scroll = true
}: Props): JSX.Element => (
  <Link href={{ pathname: href, query: queryParams }} scroll={scroll} passHref>
    <ThemeUILink variant="nostyle" title={title} sx={{ ...styles }}>
      {children}
    </ThemeUILink>
  </Link>
);
