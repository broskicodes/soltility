// import { NavLink } from '@components/NavLink';
import { NavList } from '@components/NavList';
import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faInstagram, faDiscord } from '@fortawesome/free-brands-svg-icons';

export const BottomNav: FC = () => {
  return (
    <div className="w-full bg-cover bg-gray-300 mt-16 pb-6 static bottom-0">
      <div className="container flex justify-between mx-auto">
        <div className="pt-4 pb-6 pl-2">
          <NavList row={true}>
            {/* <NavLink name="Metavillage" link="https://metavillage.app/" /> */}
          </NavList>
        </div>
        <div className="pt-4 pr-4 space-x-4">
          <a target="_blank" rel="noreferrer" href="https://twitter.com/VitalusLife">
            <FontAwesomeIcon
              icon={faTwitter}
              size={'lg'}
              className="text-slate-900 dark:text-white"
            />
          </a>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.instagram.com/vitaluslife/">
            <FontAwesomeIcon
              icon={faInstagram}
              size={'lg'}
              className="text-slate-900 dark:text-white"
            />
          </a>
          <a target="_blank" rel="noreferrer" href="https://t.co/rq760C14KB">
            <FontAwesomeIcon
              icon={faDiscord}
              size={'lg'}
              className="text-slate-900 dark:text-white"
            />
          </a>
        </div>
      </div>
    </div>
  );
};
