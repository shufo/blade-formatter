{{-- blade-formatter-disable --}}
<div>
{{-- blade-formatter-disable --}}
                {{ $foo}}
{{-- blade-formatter-enable --}}
@if ($condition < 1)
    {{-- blade-formatter-disable-next-line --}}
                {{ $user }}
@elseif ($condition < 3)
              {{ $user }}
@endif
</div>
