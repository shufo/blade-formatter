<div>
    @for ($i = 0; $i < $count; $i++)
        @for ($j = 0; $j < $num; $i++)
            <div>
                {{ $i }}{{ $j }}
            </div>
        @endfor
    @endfor
</div>
<div>
    @for ($i = 0; $i < $count; $i++)
        @if ($i != 0)
            <div>
                {{ $i }}
            </div>
        @endif
    @endfor
</div>
