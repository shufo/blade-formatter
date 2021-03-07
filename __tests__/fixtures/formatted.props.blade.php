@props([
    'variant' => 'primary',
    'colors' => [
        'primary' => 'btn-primary',
        'secondary' => 'btn-secondary',
        'danger' => 'btn-danger',
    ],
])

<button {{ $attributes->merge(['class' => "btn {$colors[$variant]}"]) }}>
    <span>{{ $slot }}</span>
</button>
