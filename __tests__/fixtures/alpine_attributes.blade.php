@section('body')
    <div id="app" class="wrapper" x-data="{
        show: true,
        toggle() {
            this.show = !this.show;
        },
        get state() {
            return show ? 'open' : 'close';
        }
    }" x-init="() => alert('123')">
        <div id="app" x-data="{
            multi_line: @true,
            multi_line() {
                console.log()
            }
        }" class="wrapper">
            <div x-data="{ userId: @entangle('userId') }" id='div1'></div>
            <div class='bg-red-500' x-data="{ error: @entangle('error') }" x-show='error' id='div1'></div>
            <div class='bg-yellow-500' x-data="{ error: @entangle('error'), 
                warning: false }" x-show='error' id='div1'></div>

        </div>
    </div>
@stop
