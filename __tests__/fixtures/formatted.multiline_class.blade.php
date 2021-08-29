@section('body')
    <div id="app" class="wrapper">
        <nav
            class="main-header navbar -fill
            {{ config('myclass.classes_spec1', 'navbar-spec1') }}
            {{ config('myclass.classes_spec2', 'navbar-spec2') }}">
            {{-- Navbar --}}
        </nav>
    </div>
@stop
