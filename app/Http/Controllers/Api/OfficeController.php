<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Office;
use Illuminate\Http\Request;

class OfficeController extends Controller
{
    public function index()
    {
        return Office::orderBy('department')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department' => 'required|string|max:255',
            'division' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'station_place' => 'nullable|string|max:255',
        ]);

        $office = Office::create($validated);
        return response()->json($office, 201);
    }

    public function show(string $id)
    {
        return Office::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'department' => 'required|string|max:255',
            'division' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'station_place' => 'nullable|string|max:255',
        ]);

        $office = Office::findOrFail($id);
        $office->update($validated);
        return response()->json($office);
    }

    public function destroy(string $id)
    {
        $office = Office::findOrFail($id);
        $office->delete();
        return response()->json(null, 204);
    }
}
