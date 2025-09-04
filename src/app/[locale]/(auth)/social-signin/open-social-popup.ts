export function openSocialPopup({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;

  const width =
    window.innerWidth ??
    document.documentElement.clientWidth ??
    window.screen.width;

  const height =
    window.innerHeight ??
    document.documentElement.clientHeight ??
    window.screen.height;

  const systemZoom = width / window.screen.availWidth;

  const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
  const top = (height - 550) / 2 / systemZoom + dualScreenTop;

  const newWindow = window.open(
    url,
    title,
    `width=${500 / systemZoom},height=${
      550 / systemZoom
    },top=${top},left=${left}`
  );

  newWindow?.focus();
}
