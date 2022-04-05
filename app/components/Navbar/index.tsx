import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FC, useCallback, useEffect } from 'react';

export const Navbar: FC = () => {
  function doToggleMenu() {
    const menu = document.querySelector('#mobile-menu'); // Menu
    menu.classList.toggle('hidden');
  }

  return (
    <nav id="nav" className="z-20 w-full border-b-gray-200 py-2 bg-gray-300">
      <div className="w-full container mx-auto flex flex-wrap justify-between">
        <div id="logo" className="my-auto md:flex text-slate-900 dark:text-white">
          {/* <Link href="/"> */}
          <a href="/" className="ml-2 font-mono text-2xl">
            Home
          </a>
        </div>
        <div className="flex pr-2 space-x-4">
          <div id="walletBtn" className="md:block">
            <WalletMultiButton className="!bg-green-700" />
          </div>
          <button
            data-collapse-toggle="mobile-menu"
            type="button"
            className="mobile-menu-button inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="mobile-menu"
            aria-expanded="false"
            onClick={doToggleMenu}>
            <span className="sr-only">Open main menu</span>
            <FontAwesomeIcon icon={faBars} size={'2x'} />
          </button>
        </div>
        <div
          className="text-slate-900 dark:text-white justify-between w-full hidden"
          id="mobile-menu">
          {/* <NavList row={false} /> */}
        </div>
      </div>
    </nav>
  );
};
