@extends('frontend.layouts.app')
@section('head')
@endsection
@section('title') bar @endsection
@section('content')
    <section id="content">
        <div class="container mod-user-pd-h">
            <div class="pf-user-header">
                <div></div>
                <p>@lang('user.edit')</p>
            </div>
            {!! Form::model($user, ['route' => ['frontend.user.user.update', $user['id']], 'method' => 'put', 'class' => 'form-horizontal', 'role' => 'form']) !!}
            <ul class="pf-user-form">
                <li>
                    <p>{!! Form::label('parent_id', __('user.parent')) !!}</p>
                    <div class="mod-width">
                        <user-auto-complete name="parent_user_name"
                            user_name="{{ \Illuminate\Support\Arr::first($parents)['name'] }}" dusk="user-auto-complete">
                        </user-auto-complete>
                    </div>
                </li>
                <li>
                    <p>{!! Form::label('name', __('user.name')) !!}</p>
                    <div class="mod-width">
                        {!! Form::text('name', old('name'), ['id' => 'user_name', 'class' => 'form-control']) !!}
                    </div>
                </li>
                <li>
                    <p>{!! Form::label('identifier_name', __('user.identifier_name')) !!}</p>
                    <div class="mod-width">
                        {!! Form::text('identifier_name', old('identifier_name'), ['class' => 'form-control']) !!}
                    </div>
                </li>
                <li>
                    <p>{!! Form::label('identified_at', __('user.identified_at')) !!}</p>
                    <div class="mod-width">
                        {!! Form::date('identified_at', old('identified_at'), ['class' => 'form-control']) !!}
                    </div>
                </li>
            </ul>
            {!! Form::hidden('identifier_id', old('identifier_id'), ['class' => 'form-control']) !!}
            <div class="pf-user-btn">
                <span>{!! Form::submit(__('labels.submit')) !!}</span>
            </div>
            {!! Form::close() !!}
        </div>
    </section>
@endsection
@section('foot')
    {!! JsValidator::formRequest(App\Http\Requests\Frontend\user\CreateuserRequest::class) !!}
@stop
