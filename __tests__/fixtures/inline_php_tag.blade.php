@extends('frontend.layouts.layout')
@section('head')
@endsection
@section('title') commonmanagement @endsection
@section('content')
    <div class="multi-column">
        <drawer-nav :items="{{ json_encode($drawerNavigation) }}" csrf-token="{{ csrf_token() }}"></drawer-nav>
        <div class="sidemenu">
            <the-sidebar :items="{{ json_encode($sidebar) }}"></the-sidebar>
        </div>
        <div class="flauto _bg-ash">
            <div class="past-and-present-details-container">
                <ul class="breadcrumb-list">
                    <li class="division"></li>
                </ul>
                <div class="contentarea">
                    <details-tab previous-page-url="{{ route('frontend.element_list.index') }}"
                        :is-next-end-date="{{ $isNextEndDate }}" @if ($detail['element_id'] !== null)
                        cancellation-date-registration-url="{{ route('frontend.element_list.detail..cancel', [$detail['id'], $detail['element_id']]) }}"
                        @endif
                        >
                        <template v-slot:tab1>
                            <div class="app-info-list">
                                <div class="item">
                                    <p class="title">
                                        foo
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['currentor_type'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        foo
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['room_number'] === 'foo' ? '-' : $detail['room_number'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        foo
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['or_last_name'] }}
                                            {{ $detail['or_first_name'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        foo
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['status'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        foo
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['start_date'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        foo
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['end_date'] ?: '-' }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        foo
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['proratable'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        foo
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            <span class="smalltitle">type</span>
                                            {{ $detail['terms_of_use'] }}
                                            <span class="thin-text">（mm）</span>
                                        </p>
                                        <p class="item -bggray">
                                            <span class="smalltitle">size</span>
                                            {{ $detail['height'] }}
                                            <span class="thin-text">( {{ $detail['height_unit'] }} )</span>
                                        </p>
                                        <p class="item -bggray">
                                            <span class="smalltitle">size</span>
                                            {{ $detail['width'] }}
                                            <span class="_thin-text"> ({{ $detail['width_unit'] }} )</span>
                                        </p>
                                        <p class="item -bggray">
                                            <span class="smalltitle">size</span>
                                            {{ $detail['weight'] }}
                                            <span class="_thin-text">（ {{ $detail['weight_unit'] }} ）</span>
                                        </p>
                                        <p class="item -bggray">
                                            <span class="smalltitle">size</span>
                                            {{ $detail['length'] }}
                                            <span class="_thin-text">（ {{ $detail['length_unit'] }} ）</span>
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        note
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['note'] ?: 'none' }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        bar
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            @if ($detail['element_id'] !== null)
                                                <box :="{{ $detail->details($detail['element_id'])->get() }}"
                                                    delete-url="{{ route('frontend.element_list.detail.delete', [request()->route('element_id'), $detail['element_id']]) }}"
                                                    upload-url="{{ route('frontend.element_list.detail.create', [request()->route('element_id'), $detail['element_id']]) }}">
                                                </box>
                                            @else
                                                error
                                            @endif
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-slot:tab2>
                            <div class="app-info-list">
                                <div class="item">
                                    <p class="title">
                                        type
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['next_type'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        title
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['next_room'] === 'external' ? '-' : $detail['next_room'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        name
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['last_name'] }}
                                            {{ $detail['first_name'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        condition
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['status'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        start
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['next_start_date'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        end
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['next_end_date'] ?: '-' }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        proratable
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['proratable'] }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        info
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            <span class="smalltitle">size</span>
                                            {{ $detail['terms_of_use'] }}
                                            <span class="_thin-text">（mm）</span>
                                        </p>
                                        <p class="item -bggray">
                                            <span class="smalltitle">size</span>
                                            {{ $detail['height'] }}
                                            <span class="_thin-text">( {{ $detail['height_unit'] }} )</span>
                                        </p>
                                        <p class="item -bggray">
                                            <span class="smalltitle">size</span>
                                            {{ $detail['width'] }}
                                            <span class="_thin-text"> ({{ $detail['width_unit'] }} )</span>
                                        </p>
                                        <p class="item -bggray">
                                            <span class="smalltitle">size</span>
                                            {{ $detail['weight'] }}
                                            <span class="_thin-text">（ {{ $detail['weight_unit'] }} ）</span>
                                        </p>
                                        <p class="item -bggray">
                                            <span class="smalltitle">size</span>
                                            {{ $detail['length'] }}
                                            <span class="_thin-text">（ {{ $detail['length_unit'] }} ）</span>
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        note
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            {{ $detail['next_note'] ?: 'none' }}
                                        </p>
                                    </div>
                                </div>
                                <div class="item">
                                    <p class="title">
                                        none
                                    </p>
                                    <div class="app-info-list-content">
                                        <p class="item -bggray">
                                            @if ($detail['next_element_id'] !== null)
                                                <box
                                                    :="{{ $detail->details($detail['next_element_id'])->get() }}"
                                                    delete-url="{{ route('frontend.element_list.detail.delete', [request()->route('element_id'), $detail['next_element_id']]) }}"
                                                    upload-url="{{ route('frontend.element_list.detail.create', [request()->route('element_id'), $detail['next_element_id']]) }}">
                                                </box>
                                            @else
                                                error
                                            @endif
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </details-tab>
                </div>
            </div>
        </div>
    </div>
@endsection
