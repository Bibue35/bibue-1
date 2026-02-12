// Module-level flag shared between useSwipeNavigation and AnimatedRoutes
let _isSwipeNav = false;

export function setSwipeNavFlag() {
  _isSwipeNav = true;
}

export function consumeSwipeNavFlag(): boolean {
  const val = _isSwipeNav;
  _isSwipeNav = false;
  return val;
}
