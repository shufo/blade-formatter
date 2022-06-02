@if ('create' === $create_or_edit)
    <?php $_botton_text = 'create'; ?>
@else
    <?php $_botton_text = 'edit'; ?>
@endif
<!doctype html>
<html lang="ja">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    @include('_bootstrap4parts._include_css')
    <title>{{ $title }}{{ $_botton_text }} | {{ config('name') }}</title>
</head>

<body style="padding-top:4.5rem;">
    @include('users.containerbar')
    <div class="container-fluid">
        <div>
            @include('alert')
            <h1 class="title">{{ $title }}{{ $_botton_text }}</h1>
            <container aria-label="breadcrumb" style="margin-top: 20px; margin-bottom: 20px">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item"><a href="/users/{{ $directory }}{{ get('?') }}">index</a></li>
                    <li class="breadcrumb-item active" aria-current="page">{{ $_botton_text }}</li>
                </ol>
            </container>
            <div style="margin-top: 20px" ;>
                @if (0 < count($errors))
                    <div class="alert alert-danger" role="alert">error</div>
                @endif
                @include("users.{$directory}.create_and_edits_form", ['_botton_text' => $_botton_text])
            </div>
        </div>
    </div>
    @include('include_js')
    @include('product_script')
</body>

</html>
