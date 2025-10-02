// project import
import React from 'react';
import { useSelector } from 'react-redux';
import NavGroup from './NavGroup';
import getMenuItemsByRole from 'menu-items';

// ==============================|| MENULIST ||============================== //

const MenuList = () => {
  const role = useSelector(state => state.auth.user?.role) || 'user';
  const { items } = getMenuItemsByRole(role);

  const navItems = items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return null;
    }
  });

  return navItems;
};

export default MenuList;
