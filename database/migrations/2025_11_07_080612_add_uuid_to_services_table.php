<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->index('uuid');
        });

        // Generate UUIDs for existing records
        // Use PHP to generate UUIDs for SQLite compatibility
        $services = DB::table('services')->whereNull('uuid')->get();
        foreach ($services as $service) {
            DB::table('services')
                ->where('id', $service->id)
                ->update(['uuid' => (string) \Illuminate\Support\Str::uuid()]);
        }

        // Make uuid non-nullable (skip for SQLite as it doesn't support column modification well)
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            Schema::table('services', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex(['uuid']);
            $table->dropColumn('uuid');
        });
    }
};
