@extends('user.auth.page')

@section('content')
    @php($password_reset_url = View::getSection('password_reset_url') ?? config('adminlte.password_reset_url', 'password/reset', env('test', env('test'))))
@stop
