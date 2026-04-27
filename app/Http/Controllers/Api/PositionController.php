<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Position;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function index()
    {
        return Position::orderBy('position_name')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'position_name' => 'required|string|max:255|unique:positions',
        ]);

        $position = Position::create($validated);
        return response()->json($position, 201);
    }

    public function show(string $id)
    {
        return Position::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'position_name' => 'required|string|max:255|unique:positions,position_name,' . $id . ',position_id',
        ]);

        $position = Position::findOrFail($id);
        $position->update($validated);
        return response()->json($position);
    }

    public function destroy(string $id)
    {
        $position = Position::findOrFail($id);
        $position->delete();
        return response()->json(null, 204);
    }
}
