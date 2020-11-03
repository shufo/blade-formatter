<header class="face <?= isset($face_class) ? $face_class : '' ?>">
  <div class="container d-flex">
    @if (isset($face_class) && $face_class === 'face-narrow')
    <div class="col-md-7 face__wrapper">
      @else
      <div class="col-md-6 face__wrapper">
        @endif
        <h1 class="face__title">{{ $face_title }}</h1>
        @isset ($face_subtitle)
        <p class="face__subtitle">{{ $face_subtitle }}</p>
        @endisset
        @isset ($face_desc)
        <span class="face__text">{!! $face_desc !!}
          @endisset
          @isset ($face_desc_mb_hide)
          <span class="face__text d-none d-lg-inline">&ThinSpace;{!!
$face_desc_mb_hide !!}</span>
          @endisset
        </span>
        @isset ($face_btn_text)
        <div class="face__button-box">
          <a href="{{ $face_anchor or '#request-form' }}" class="btn_regular"
            onclick="yaCounter.reachGoal('form'); return true;">{{ $face_btn_text }}</a>
          @endisset
          @isset ($clutch)
          <script type="text/javascript"
            src="https://widget.clutch.co/static/js/widget.js">
          </script>
          <div class="face__clutch clutch-widget"
            data-url="https://widget.clutch.co" data-widget-type="2"
            data-height="50" data-clutchcompany-id="861064"
            {{ $clutch === 'dark' ? 'data-darkbg="1"' : '' }}>
          </div>
          @endisset
          @isset ($face_btn_text)
        </div>
        @endisset
      </div>
      @if (isset($face_class) && $face_class === 'face-wide')
      <div class="col-md-7 face__image-box">
        @else
        <div class="col-md-7 col-lg-6 face__image-box">
          @endif
          @isset ($face_image)
          <picture>
            @isset ($face_image_webp)
            <source srcset="{{ $face_image_webp }}" type="image/webp">
            @endisset
            <img class="face__image" src="{{ $face_image }}" alt="Logo">
          </picture>
          @endisset
        </div>
      </div>
</header>
