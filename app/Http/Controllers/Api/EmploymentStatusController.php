<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploymentStatus;
use Illuminate\Http\Request;

class EmploymentStatusController extends Controller
{
    public function index()
    {
        return EmploymentStatus::orderBy('status_name')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'status_name' => 'required|string|max:255|unique:employment_status',
        ]);

        $status = EmploymentStatus::create($validated);
        return response()->json($status, 201);
    }

    public function show(string $id)
    {
        return EmploymentStatus::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'status_name' => 'required|string|max:255|unique:employment_status,status_name,' . $id . ',status_id',
        ]);

        $status = EmploymentStatus::findOrFail($id);
        $status->update($validated);
        return response()->json($status);
    }

    public function destroy(string $id)
    {
        $status = EmploymentStatus::findOrFail($id);
        $status->delete();
        return response()->json(null, 204);
    }
}
