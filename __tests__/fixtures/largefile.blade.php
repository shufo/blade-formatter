<div class="card card-primary card-outline">
    <div class="card-body box-profile">
        <div class="text-center">
            <img class="profile-user-img img-fluid img-circle"
                src="{{ $master_vendor->photo_url }}"
                alt="User profile picture">
        </div>

        <p class="text-muted text-center">{{ $master_vendor->category_vendor->name }}</p>

        <ul class="nav nav-pills flex-column">
            <li class="nav-item">
                <a href="{{ route('vendor.index', [$master_vendor->hashid()]) }}"
                    class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'dashboard')) {{ 'active' }} @endif">
                    <i class="fas fa-home"></i> Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('vendor.restaurant.index', [$master_vendor->hashid()]) }}"
                    class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'restaurant')) {{ 'active' }} @endif">
                    <i class="fas fa-utensils"></i> Restaurant
                </a>
            </li>
            @if ($master_vendor->category_vendor->is_medical_facility == 1)
                @if (Auth::user()->hasRole(['owner', 'administrator']))
                    <li class="nav-item">
                        <a href="{{ route('vendor.online_consultation', [$master_vendor->hashid()]) }}"
                            class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'online_consultation')) {{ 'active' }} @endif">
                            <i class="fas fa-user-md"></i> Online Consultation
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="{{ route('vendor.home_medicare', [$master_vendor->hashid()]) }}"
                            class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'home_medicare')) {{ 'active' }} @endif">
                            <i class="fas fa-house-user"></i> Home Medicare
                            <span class="right badge badge-danger notif-home-medicare-order-active"></span>
                        </a>
                    </li>
                    @if (in_array($master_vendor->category_vendor->id, config('feature.reservation.allow')))
                        <li class="nav-item">
                            <a href="{{ route('vendor.reservation', [$master_vendor->hashid()]) }}"
                                class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'reservation')) {{ 'active' }} @endif">
                                <i class="fas fa-building"></i> Reservation
                                <span class="right badge badge-danger notif-reservation-order-active"></span>
                            </a>
                        </li>
                    @endif
                    @if (in_array($master_vendor->category_vendor->id, config('feature.drugs_medical_tools.allow')))
                        <li class="nav-item">
                            <a href="{{ route('vendor.drugs_medical_tools', [$master_vendor->hashid()]) }}"
                                class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'drugs_medical_tools')) {{ 'active' }} @endif">
                                <i class="fas fa-pills"></i> Drugs & Medical Tools <span
                                    class="right badge badge-danger notif-drugs-medical-tools-order-active"></span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('vendor.drugs_medical_tools_clinic', [$master_vendor->hashid()]) }}"
                                class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'drugs_medical_tools_clinic')) {{ 'active' }} @endif">
                                <i class="fas fa-pills"></i> Drugs & Medical For Clinic<span
                                    class="right badge badge-danger notif-drugs-medical-tools-clinic-order-active"></span>
                            </a>
                        </li>
                    @endif
                    @if (in_array($master_vendor->category_vendor->id, config('feature.evacuation.allow')))
                        <li class="nav-item">
                            <a href="{{ route('vendor.evacuation', [$master_vendor->hashid()]) }}"
                                class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'evacuation')) {{ 'active' }} @endif">
                                <i class="fas fa-ambulance"></i> Evacuation <span
                                    class="right badge badge-danger notif-evacuation-order-active"></span>
                            </a>
                        </li>
                    @endif
                    @if (in_array($master_vendor->category_vendor->id, config('feature.emergency.allow')))
                        <li class="nav-item">
                            <a href="{{ route('vendor.emergency', [$master_vendor->hashid()]) }}"
                                class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'emergency')) {{ 'active' }} @endif">
                                <i class="fas fa-heartbeat"></i> Emergency <span
                                    class="right badge badge-warning notif-emergency-order-active"></span>
                            </a>
                        </li>
                    @endif
                @endif
            @endif
            @if (Auth::user()->hasRole(['owner', 'administrator']))
                @if (in_array($master_vendor->category_vendor->id, config('feature.education_training.allow')))
                    <li class="nav-item">
                        <a href="{{ route('vendor.education_training.index', [$master_vendor->hashid()]) }}"
                            class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'education_training')) {{ 'active' }} @endif">
                            <i class="fas fa-chalkboard-teacher"></i> Education Training
                        </a>
                    </li>
                @endif
            @endif
            @if (Auth::user()->hasRole(['owner', 'administrator']))
                @if (in_array($master_vendor->category_vendor->id, config('feature.catering.allow')))
                    <li class="nav-item">
                        <a href="{{ route('vendor.catering', [$master_vendor->hashid()]) }}"
                            class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'catering')) {{ 'active' }} @endif">
                            <i class="fas fa-utensils"></i> Catering <span
                                class="right badge badge-danger notif-catering-order-active"></span>
                        </a>
                    </li>
                @endif
            @endif
            @if ($master_vendor->category_vendor->is_medical_facility == 1)
                @if (Auth::user()->hasRole(['medical-personnel', 'health-personnel']))
                    <li class="nav-item">
                        <a href="{{ route('vendor.personnel.operational_hours.index', [$master_vendor->hashid()]) }}"
                            class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'personnel_operational_hours')) {{ 'active' }} @endif">
                            <i class="fas fa-clock"></i> Operational Hours
                        </a>
                    </li>
                @endif
                @if (Auth::user()->hasRole(['owner', 'administrator']))
                    <li class="nav-item">
                        <a href="{{ route('vendor.operational_hours', [$master_vendor->hashid()]) }}"
                            class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'vendor_operational_hours')) {{ 'active' }} @endif">
                            <i class="fas fa-clock"></i> Operational Hours
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="{{ route('vendor.holiday_schedule.index', [$master_vendor->hashid()]) }}"
                            class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'vendor_holiday_schedule')) {{ 'active' }} @endif">
                            <i class="fas fa-calendar"></i> Holiday Schedule
                        </a>
                    </li>
                @endif
            @endif
            @if (Auth::user()->hasRole(['owner']))
                <li class="nav-item">
                    <a href="{{ route('vendor.wallet.index', [$master_vendor->hashid()]) }}"
                        class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'wallet')) {{ 'active' }} @endif">
                        <i class="fas fa-wallet"></i> Wallet
                    </a>
                </li>
                <li class="nav-item">
                    <a href="{{ route('vendor.bank_account.index', [$master_vendor->hashid()]) }}"
                        class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'bank_account')) {{ 'active' }} @endif">
                        <i class="fas fa-university"></i> Bank Account
                    </a>
                </li>
            @endif
            @if (Auth::user()->hasRole(['owner', 'administrator']))
                <li class="nav-item">
                    <a href="{{ route('vendor.users.index', [$master_vendor->hashid()]) }}"
                        class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'users')) {{ 'active' }} @endif">
                        <i class="fas fa-users"></i> Users
                    </a>
                </li>
                <li class="nav-item">
                    <a href="{{ route('vendor.refferal.index', [$master_vendor->hashid()]) }}"
                        class="nav-link @if (sidemenu_active($resource->link_menu, 0, 'refferal')) {{ 'active' }} @endif">
                        <i class="fas fa-book"></i> Refferal
                    </a>
                </li>
            @endif
        </ul>
    </div>
</div>

@if (!sidemenu_active($resource->link_menu, 0, 'edit'))
    <div class="card card-primary">
        <div class="card-header">
            <h3 class="card-title">About Us</h3>
        </div>
        <div class="card-body">

            <strong><i class="fas fa-book mr-1"></i> Description</strong>

            <p class="text-muted">
                {{ $master_vendor->description ?? '-' }}
            </p>

            <hr>

            <strong><i class="fas fa-phone mr-1"></i> Phone</strong>

            <p class="text-muted">
                {{ $master_vendor->phone ?? '-' }}
            </p>

            <hr>

            <strong><i class="fas fa-map mr-1"></i> Location</strong>

            <p class="text-muted">
                {{ $master_vendor->sub_district->name ?? '-' }}
                <br />
                {{ $master_vendor->district->name ?? '-' }}
                <br />
                {{ $master_vendor->province->name ?? '-' }}
                <br />
                {{ $master_vendor->country->name ?? '-' }}
                <br />
                ( {{ $master_vendor->postal_code ?? '-' }} )
            </p>

            <hr>

            <strong><i class="fas fa-building mr-1"></i> Address</strong>

            <p class="text-muted">
                {{ $master_vendor->address ?? '-' }}
            </p>

            <hr>

            <strong><i class="fas fa-map-marker-alt mr-1"></i> Location</strong>

            <p class="text-muted">
                @if ($master_vendor->latitude != '' && $master_vendor->longitude != '')
                    <a href="https://www.google.com/maps/?q={{ $master_vendor->latitude }},{{ $master_vendor->longitude }}"
                        target="_blank">Google Map</a>
                @else
                    -
                @endif
            </p>

            @if (Auth::user()->hasRole(['owner', 'administrator']))
                <a href="{{ route('vendor.edit', [$master_vendor->hashid()]) }}"
                    class="btn btn-primary btn-block"><b>Edit</b></a>
            @endif
        </div>

    </div>
@endif

@section('sub_sub_scripts')
    <script type="text/javascript">
        var miniNotif = function() {
            var notif_count = {
                home_medicare: {
                    active: 0,
                    history: 0,
                },
                reservation: {
                    active: 0,
                    history: 0,
                },
                drugs_medical_tools: {
                    active: 0,
                    history: 0,
                },
                education_training: {
                    active: 0,
                    history: 0,
                },
                catering: {
                    active: 0,
                    history: 0,
                },
                evacuation: {
                    active: 0,
                    history: 0,
                },
                emergency: {
                    active: 0,
                    history: 0,
                },
            };
            var ajaxNotifHomeMedicareOrderActive = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.home_medicare.order.active') }}",
                    data: data,
                });
            }
            var ajaxNotifHomeMedicareOrderHistory = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.home_medicare.order.history') }}",
                    data: data,
                });
            }
            var ajaxNotifReservationOrderActive = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.reservation.order.active') }}",
                    data: data,
                });
            }
            var ajaxNotifReservationOrderHistory = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.reservation.order.history') }}",
                    data: data,
                });
            }
            var ajaxNotifDrugsMedicalToolsOrderActive = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.drugs_medical_tools.order.active') }}",
                    data: data,
                });
            }
            var ajaxNotifDrugsMedicalToolsOrderHistory = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.drugs_medical_tools.order.history') }}",
                    data: data,
                });
            }
            var ajaxNotifCateringOrderActive = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.catering.order.active') }}",
                    data: data,
                });
            }
            var ajaxNotifCateringOrderHistory = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.catering.order.history') }}",
                    data: data,
                });
            }
            var ajaxNotifEvacuationOrderActive = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.evacuation.order.active') }}",
                    data: data,
                });
            }
            var ajaxNotifEvacuationOrderHistory = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.evacuation.order.history') }}",
                    data: data,
                });
            }
            var ajaxNotifEmergencyOrderActive = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.emergency.order.active') }}",
                    data: data,
                });
            }
            var ajaxNotifEmergencyOrderHistory = function(data) {
                return $.ajax({
                    method: "GET",
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    url: "{{ route('api.notif.vendor.emergency.order.history') }}",
                    data: data,
                });
            }
            var notif_home_medicare = function() {
                ajaxNotifHomeMedicareOrderActive({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.home_medicare.active) != parseInt(total)) {
                        notif_count.home_medicare.active = total;
                        if (total == 0) {
                            $(".notif-home-medicare-order-active").html('');
                        } else {
                            $(".notif-home-medicare-order-active").html(total);
                        }
                        $(".notif-home-medicare-order-active-page").html(total);
                    }
                });
                ajaxNotifHomeMedicareOrderHistory({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.home_medicare.history) != parseInt(total)) {
                        notif_count.home_medicare.history = total;
                        $(".notif-home-medicare-order-history-page").html(total);
                    }
                });
            }
            // done
            var notif_reservation = function() {
                ajaxNotifReservationOrderActive({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.reservation.active) != parseInt(total)) {
                        notif_count.reservation.active = total;
                        if (total == 0) {
                            $(".notif-reservation-order-active").html('');
                        } else {
                            $(".notif-reservation-order-active").html(total);
                        }
                        $(".notif-reservation-order-active-page").html(total);
                    }
                });
                ajaxNotifReservationOrderHistory({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.reservation.history) != parseInt(total)) {
                        notif_count.reservation.history = total;
                        $(".notif-reservation-order-history-page").html(total);
                    }
                });
            }
            var notif_drugs_medical_tools = function() {
                ajaxNotifDrugsMedicalToolsOrderActive({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.drugs_medical_tools.active) != parseInt(total)) {
                        notif_count.drugs_medical_tools.active = total;
                        if (total == 0) {
                            $(".notif-drugs-medical-tools-order-active").html('');
                        } else {
                            $(".notif-drugs-medical-tools-order-active").html(total);
                        }
                        $(".notif-drugs-medical-tools-order-active-page").html(total);
                    }
                });
                ajaxNotifDrugsMedicalToolsOrderHistory({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.drugs_medical_tools.history) != parseInt(total)) {
                        notif_count.drugs_medical_tools.history = total;
                        $(".notif-drugs-medical-tools-order-history-page").html(total);
                    }
                });
            }
            var notif_catering = function() {
                ajaxNotifCateringOrderActive({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.catering.active) != parseInt(total)) {
                        notif_count.catering.active = total;
                        if (total == 0) {
                            $(".notif-catering-order-active").html('');
                        } else {
                            $(".notif-catering-order-active").html(total);
                        }
                        $(".notif-catering-order-active-page").html(total);
                    }
                });
                ajaxNotifCateringOrderHistory({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.catering.history) != parseInt(total)) {
                        notif_count.catering.history = total;
                        $(".notif-catering-order-history-page").html(total);
                    }
                });
            }
            var notif_evacuation = function() {
                ajaxNotifEvacuationOrderActive({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.evacuation.active) != parseInt(total)) {
                        notif_count.evacuation.active = total;
                        if (total == 0) {
                            $(".notif-evacuation-order-active").html('');
                        } else {
                            $(".notif-evacuation-order-active").html(total);
                        }
                        $(".notif-evacuation-order-active-page").html(total);
                    }
                });
                ajaxNotifEvacuationOrderHistory({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.evacuation.history) != parseInt(total)) {
                        notif_count.evacuation.history = total;
                        $(".notif-evacuation-order-history-page").html(total);
                    }
                });
            }
            var notif_emergency = function() {
                ajaxNotifEmergencyOrderActive({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.emergency.active) != parseInt(total)) {
                        notif_count.emergency.active = total;
                        if (total == 0) {
                            $(".notif-emergency-order-active").html('');
                        } else {
                            $(".notif-emergency-order-active").html(total);
                        }
                        $(".notif-emergency-order-active-page").html(total);
                    }
                });
                ajaxNotifEmergencyOrderHistory({
                    master_vendor: '{{ $master_vendor->hashid() }}'
                }).done(function(values) {
                    var total = values.data;
                    if (parseInt(notif_count.emergency.history) != parseInt(total)) {
                        notif_count.emergency.history = total;
                        $(".notif-emergency-order-history-page").html(total);
                    }
                });
            }
            var mini_notif = function() {
                @if ($master_vendor->category_vendor->is_medical_facility == 1)
                    notif_home_medicare();
                    notif_reservation();
                    notif_drugs_medical_tools();
                    notif_evacuation();
                    notif_emergency();
                @endif
                @if (in_array($master_vendor->category_vendor->id, config('feature.catering.allow')))
                    notif_catering();
                @endif
            }
            return {
                init: function() {
                    @if (Auth::user()->hasRole(['owner', 'administrator']))
                        mini_notif();
                    @endif
                },
                // done
                get_notif_home_medicare: function() {
                    @if ($master_vendor->category_vendor->is_medical_facility == 1)
                        notif_home_medicare();
                        if (typeof page.refreshTable !== 'undefined') {
                            page.refreshTable();
                        }
                    @endif
                },
                // done
                get_notif_reservation: function() {
                    @if ($master_vendor->category_vendor->is_medical_facility == 1)
                        notif_reservation();
                        if (typeof page.refreshTable !== 'undefined') {
                            page.refreshTable();
                        }
                    @endif
                },
                // done
                get_notif_drugs_medical_tools: function() {
                    @if ($master_vendor->category_vendor->is_medical_facility == 1)
                        notif_drugs_medical_tools();
                        if (typeof page.refreshTable !== 'undefined') {
                            page.refreshTable();
                        }
                    @endif
                },
                // done
                get_notif_evacuation: function() {
                    @if ($master_vendor->category_vendor->is_medical_facility == 1)
                        notif_evacuation();
                        if (typeof page.refreshTable !== 'undefined') {
                            page.refreshTable();
                        }
                    @endif
                },
                // done
                get_notif_emergency: function() {
                    @if ($master_vendor->category_vendor->is_medical_facility == 1)
                        notif_emergency();
                        if (typeof page.refreshTable !== 'undefined') {
                            page.refreshTable();
                        }
                    @endif
                },
                // done
                get_notif_catering: function() {
                    @if (in_array($master_vendor->category_vendor->id, config('feature.catering.allow')))
                        notif_catering();
                        if (typeof page.refreshTable !== 'undefined') {
                            page.refreshTable();
                        }
                    @endif
                },
            };
        }();
        $(function() {
            miniNotif.init();
        });
    </script>
@endsection
