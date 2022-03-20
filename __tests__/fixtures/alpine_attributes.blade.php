@section('body')
    <div id="app" class="wrapper" x-data="{
    show: true,
    toggle(){this.show = !this.show;
    },get state(){
        return show ? 'open' : 'close';
    }}" x-init="() => alert('123')">
        <div id="app"  x-data="{
    multi_line: @true,
    multi_line() {
        console.log()
    }
}" class="wrapper">
        <div x-data="{userId: @entangle('userId')}" id='div1'></div>

        </div>
    </div>
@stop
