@php $user = str_repeat( '', (int)($products ?? 0) ); @endphp

@if ($user)
    @foreach ($users as $user)
        @php
            $users = $_GET;
            
            foreach ($users as $key1 => $value) {
                if (is_array($value)) {
                    foreach ($value as $key2 => $value2) {
                        if (!_empty($value2)) {
                            print "{$user}<input type=\"hidden\" name=\"{$key1}[]\" value=\"{$value2}\">\n";
                        }
                    }
                } else {
                    if (!_empty($value)) {
                        print "{$user}<input type=\"hidden\" name=\"{$key1}\" value=\"{$value}\">\n";
                    }
                }
            }
        @endphp
    @endforeach
@endif
