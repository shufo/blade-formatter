@section('body')
    <x-forms.radios legend="Meeting Schedule" name="meeting_type" value="single" v-model="form.meeting_type" :inline="true"
        :options="[
            'single' => ['label' => 'Default'],
            'series' => ['label' => 'Recurring meeting'],
            'scheduler' => ['label' => 'Find a meeting date'],
        ]" />
    <x-h1 :variable123-with-hyphen="['array' => 123]" />
    <x-h1 legend="Meeting Schedule" name="meeting_type" value="single" v-model="form.meeting_type" :variable123-with-hyphen="[
        'array' => 123,
        'series' => ['label' => 'Recurring meeting'],
        'series2' => ['label' => 'Recurring meeting'],
        'series3' => ['label' => 'Recurring meeting'],
    ]" />
    <div>
        <x-h1 :variable1="[
            'key1' => 123,
            'key2' => 'value2',
        ]" :message="$message" :variable2="[
            'key1' => 123,
            'key2' => 'value2',
        ]" />
    </div>
    <x-aaa color="purple" :foo="aaa" />
    <x-menu color="purple" :foo="aaa">
        <x-menu.item>...</x-menu.item>
        <x-menu.item>...</x-menu.item>
    </x-menu>
    <x-alert type="error" :message="$message" class="mb-4" />
    <div :foo="aaaa">
    </div>
    <div :foo="aaaa" />
    <div :aaa="aaaa">
    </div>
    <foo :hoge="aaa">
    </foo>
    <x-app>
        <x-slot name="title">
            Laravel Components
        </x-slot>

        <x-slot name="sidebar">
            <p>add this to sidebar</p>
        </x-slot>

        <h1 class="text-2xl">Laravel Components</h1>
        <x-app>
            <h1 class="text-2xl">Laravel Components</h1>
            <x-alert :message="$message" />
        </x-app>
        <x-app>
            <h1 class="text-2xl">Laravel Components</h1>
            <x-alert :message='$message' />
        </x-app>
    </x-app>
    <x-h1 :modifiers="['no-margin' => true]"></x-h1>

    <x-form-group name="interests" label="Pick one or more interests">
        <x-form-checkbox name="interests[]" :show-errors="false" value="laravel" label="Laravel" />
        <x-form-checkbox name="interests[]" :show-errors="false" value="tailwindcss" label="Tailwind CSS" />
    </x-form-group>
    <x-laravel-blade-sortable::sortable>
        <x-laravel-blade-sortable::sortable-item sort-key="jason">
            Jason
        </x-laravel-blade-sortable::sortable-item>
        <x-laravel-blade-sortable::sortable-item sort-key="andres">
            Andres
        </x-laravel-blade-sortable::sortable-item>
        <x-laravel-blade-sortable::sortable-item sort-key="matt">
            Matt
        </x-laravel-blade-sortable::sortable-item>
        <x-laravel-blade-sortable::sortable-item sort-key="james">
            James
        </x-laravel-blade-sortable::sortable-item>
    </x-laravel-blade-sortable::sortable>
    <x-laravel-blade-sortable::sortable name="dropzone" wire:onSortOrderChange="handleSortOrderChange">
        {{-- Items here --}}
    </x-laravel-blade-sortable::sortable>
    <x-alert type="error" :message="1" class="mb-4" />
    <x-alert type="error" :message="'foo'" class="mb-4" />
    <x-alert type="error" :message="" class="mb-4" />
    <x-button ::class="{ danger: isDeleting, danger1: isDeleting, danger2: isDeleting, danger3: isDeleting }">
        Submit
    </x-button>
    <x-button ::class="{
        danger: isDeleting,
        danger1: isDeleting,
        danger2: isDeleting,
        danger3: isDeleting,
        danger4: isDeleting,
        danger5: isDeleting
    }">
        Submit
    </x-button>
    <x-button ::style="{ color: 'red', display: 'flex' }">
        Submit
    </x-button>
@endsection
