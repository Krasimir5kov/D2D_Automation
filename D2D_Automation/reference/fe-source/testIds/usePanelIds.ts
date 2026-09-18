import { useLocation, useParams } from 'react-router-dom';
import { OBJECT_PANEL_IDS } from './objectPanel.ids';
import { USER_SIDE_PANEL_STATIC_IDS } from './userSidePanel.ids';

export const usePanelIds = () => {
  const { pathname } = useLocation();
  const { id } = useParams<{ id?: string }>();

  const ids = pathname.includes('/neubau/')
    ? OBJECT_PANEL_IDS.neubau
    : pathname.includes('/ftth/')
      ? OBJECT_PANEL_IDS.ftth
      : pathname.includes('/bestandsbau/')
        ? OBJECT_PANEL_IDS.bestandsbau
        : pathname.includes('/users/')
          ? (USER_SIDE_PANEL_STATIC_IDS as unknown as typeof OBJECT_PANEL_IDS.neubau)
          : null;

  return ids ? { ids, objectId: id ? +id : undefined } : null;
};
