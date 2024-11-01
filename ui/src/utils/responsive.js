// Define breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

export const isDeviceMobile = () => window.innerWidth <= BREAKPOINTS.MOBILE;
export const isDeviceTablet = () => window.innerWidth <= BREAKPOINTS.TABLET && window.innerWidth > BREAKPOINTS.MOBILE;
export const isDeviceDesktop = () => window.innerWidth > BREAKPOINTS.TABLET;

export const getInitialPanelState = () => {
  const isMobile = isDeviceMobile();
  return !isMobile; // Open on desktop/tablet, closed on mobile
};

export const handleResponsiveState = (setters) => {
  if (isDeviceMobile()) {
    Object.values(setters).forEach(setter => setter(false));
  }
}; 