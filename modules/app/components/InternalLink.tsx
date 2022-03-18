import Link from 'next/link';
import { Link as ThemeUILink } from 'theme-ui';

type Props = {
  children: JSX.Element;
  href: string;
  title: string;
  as?: string;
};

export const InternalLink = ({ children, title, href, as }: Props): JSX.Element => (
  <Link href={{ pathname: href }} as={as ? { pathname: as } : undefined} passHref>
    <ThemeUILink variant="nostyle" title={title}>
      {children}
    </ThemeUILink>
  </Link>
);
