<div>
    @if (@user)
        <!-- inline custom directive -->
        @hello('LaraShout')
        <!-- basic custom directive -->
        @routeis('home')
            // Your stuff here
        @endrouteis
        <!-- custom directive without parenthesis -->
        @isHome
            we are on home
        @else
            not home
        @endisHome

        @disk('local')
            <!-- nested custom directive -->
            @diskusage('diskusage')
                foo
                @mypermissions($foo)
                    something goes here
                @endmypermissions
            @enddiskusage
            <!-- else directive -->
        @elsedisk('s3')
            <!-- else -->
        @else
            <!-- The application is using some other disk... -->
        @enddisk

        <!-- unless custom directive -->
        @unlessdisk('local')
            <!-- The application is not using the local disk... -->
            @breakdown($user->image->foo)
                bar
            @endbreakdown
        @enddisk
        @breakdown([
            'breakdown' => $cart_breakdown,
            'existing_customer' => false,
            'existing_customer' => $user->profile->image,
            'non_existing_customer' => true
        ])
            zoo
        @endbreakdown
        @breakdown(['breakdown' => $cart_breakdown, 'non_existing_customer' => true])
            zoo
        @endbreakdown
        @session('success')
            <div class="alert alert-success">{{ \Session::get('success') }}</div>
        @elsesession('error')
            <div class="alert alert-danger">{{ \Session::get('error') }}</div>
        @else
            {{-- nothing to show --}}
        @endsession
        @style
            body { background: black }
        @endstyle
        @style('/css/app.css')
        @script
            alert('hello world')
        @endscript

        @script('/js/app.js')
        @pushonce('js:foobar')
            <script src="{{ asset('/js/foobar.js') }}"></script>
        @endpushonce
        @routeis('webshop.checkout')
            Do something only on the checkout
        @endrouteis
        @routeisnot('webshop.checkout')
            Do something only if this is not the checkout
        @endrouteisnot
        @instanceof($user, 'App\User')
            User is an instance of App\User
        @endinstanceof
        @repeat(3)
            Iteration #{{ $iteration }}
        @endrepeat
        @haserror('input_name')
            This input has an error
        @endhaserror
    @endif

    <!-- inlined custom directive -->
    @routeis('home')
        // Your stuff here
    @endrouteis
    <!-- inlined if~else-endif custom directive -->
    @session('success')
        <div class="alert alert-success">{{ \Session::get('success') }}</div>
    @else
        {{-- nothing to show --}}
    @endsession
    <!-- inlined if~elseif~else~endif custom directive -->
    @disk('local')
        <!-- nested custom directive -->
    @elsedisk('s3')
        <!-- else -->
    @else
        <!-- The application is using some other disk... -->
    @enddisk
</div>
