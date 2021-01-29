{{-- @foreach ($downloadOptions as $d => $dO)
    <tr>
        <td>{{ $dO['description'] }}</td>
        <td>{{ $dO['cost'] }}</td>
        <td>
            <form method="POST" action="{{ route('bonusexchange', ['id' => $dO['id']]) }}">
                @csrf
                <button type="submit" class="btn btn-sm btn-info btn-exchange">@lang('bon.exchange')</button>
            </form>
        </td>
    </tr>
@endforeach --}}

{{-- @json($array) --}}
