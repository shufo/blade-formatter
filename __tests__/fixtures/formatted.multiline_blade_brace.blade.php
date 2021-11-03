                        <h1 class="auth__header">
                            {{ trans('ui.auth.login.header') }}
                        </h1>
                        <div class="auth__title">
                            {{ trans('ui.auth.login.title') }}
                        </div>
                        <div>
                            {{ Form::open([
                                'route' => ['auth.login'],
                                'method' => 'post',
                                'data-validate-form',
                                'data-form-blocking',
                            ]) }}
                        </div>

                        {{ Form::open([
                            'route' => ['auth.login'],
                            'method' => 'post',
                            'data-validate-form',
                            'data-form-blocking',
                        ]) }}
                        <div class="form-group">
                            {{ Form::label('password', trans('form.password')) }}
                            {{ Form::password('password', [
                                'class' => 'form-control' . ($errors->has('password') ? ' is-invalid' : ''),
                                'autocomplete' => 'current-password',
                                'data-password',
                                'required',
                            ]) }}
                            {{ Form::errors('password') }}
                        </div>
