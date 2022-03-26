import { NavLink } from '@components/NavLink';
import { FC } from 'react';

export const NavList: FC<{ row: boolean }> = ({ children, row }) => {
  return (
    <ul
      className={'flex flex-col mt-4 ml-2 md:mt-0 md:text-sm md:font-medium'.concat(
        row ? ' md:flex-row md:space-x-8' : ''
      )}>
      <NavLink name={'Profile'} link={'/profile'} />
      {/* <NavLink name={'Jungle Club'} link={'jungle_club'} /> */}
      {children}
    </ul>
  );
};
