/* Shared SVG filters, injected once into every page.
   - #inkrough / #inkroughsoft power the .mg-letterpress and .mg-printed text.
   - #inkbreak erodes the hand-drawn lines so they read as uneven ink.
   Injecting from one file keeps the filter definitions in a single place. */
(function () {
  const MARKUP = `
    <svg id="mg-filters" width="0" height="0" aria-hidden="true"
         style="position:absolute;width:0;height:0;overflow:hidden">
      <filter id="inkrough">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="inkroughsoft">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1"/>
      </filter>
      <!-- even fainter wobble, for small text like code -->
      <filter id="inkfaint">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.55"/>
      </filter>
      <!-- roughen the edge, then erode small flecks out of the stroke -->
      <filter id="inkbreak" x="-5%" y="-400%" width="110%" height="900%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.7" numOctaves="2" seed="7" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.0"
                           xChannelSelector="R" yChannelSelector="G" result="edged"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.34" numOctaves="2" seed="4" result="speck"/>
        <feColorMatrix in="speck" type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="speckA"/>
        <feComponentTransfer in="speckA" result="mask">
          <feFuncA type="discrete" tableValues="0 1 1 1 1 1 1 1"/>
        </feComponentTransfer>
        <feComposite in="edged" in2="mask" operator="in"/>
      </filter>
    </svg>`;

  function inject() {
    if (document.getElementById('mg-filters')) return;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    wrap.innerHTML = MARKUP;
    document.body.insertBefore(wrap.firstElementChild, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
